import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import authRouter from "./routes/auth.js";
import orgRouter from "./routes/organization.js";
import teamRouter from "./routes/team.js";
import projRouter from "./routes/project.js";
import http from "http";
import Redis from 'ioredis';
import { Server } from "socket.io";
import bodyParser from "body-parser";
import { createAdapter } from "@socket.io/redis-adapter";
import chatRouter from './routes/chat.js';
import { Message } from "./models/chat.js";
import { BlobServiceClient } from "@azure/storage-blob";
import multer from "multer";
import authMiddleware from "./middlewares/auth.js";
import meetingRouter from "./routes/meeting.js";
import formRouter from "./routes/form.js";
import Form from "./models/form.js";
import Response from "./models/response.js";
import responseTime from 'response-time';
import compression from 'compression';
import morgan from 'morgan';

const app = express();
const server = http.createServer(app);
const upload = multer();

// Setup Redis connection
const pubClient = new Redis(process.env.REDIS_URL);
const subClient = pubClient.duplicate()


pubClient.on('error', (err) => {
  console.error('Redis connection error:', err);
});

subClient.on('error', (err) => {
  console.error('Redis subscription connection error:', err);
});

pubClient.on('connect', () => {
  console.log('Connected to Redis');
});

subClient.on('connect', () => {
  console.log('Connected to Redis subscription');
});

// Handle Redis reconnection logic
pubClient.on('reconnecting', () => {
  console.log('Reconnecting to Redis...');
});

subClient.on('reconnecting', () => {
  console.log('Reconnecting to Redis subscription...');
});




const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Use Redis adapter for Socket.IO
io.adapter(createAdapter(pubClient, subClient));

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('joinRoom', ({ chatRoomId }) => {
    socket.join(chatRoomId);
  });

  socket.on('sendMessage', async (msg) => {
    try {
      console.log("In server send message", msg);
      const { senderId, content, chatRoomId, type } = msg;
      let message = null;
      if (type === 'text') {
        message = new Message({ sender: senderId, content, chatRoom: chatRoomId, type: type });
        await message.save();
      } else {
        message = msg;
      }
      console.log("emitting", message);
      io.to(chatRoomId).emit('receiveMessage', message);
    } catch (error) {
      console.error('Error handling sendMessage:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

app.use(bodyParser.json());
app.use(express.json());
app.use(cors());
app.use(responseTime());
app.use(compression());
app.use(morgan('combined'));



const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_BLOB_CONNECTION_STRING);
const containerClient = blobServiceClient.getContainerClient(process.env.CONTAINER);

const createBlobInContainer = async (blobName, buffer) => {
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  await blockBlobClient.uploadData(buffer);
  return blockBlobClient.url;
};

app.post('/upload/:chatRoomId', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).send('No file uploaded.');
    }

    const blobName = `${Date.now()}-${file.originalname}`;
    const blobUrl = await createBlobInContainer(blobName, file.buffer);

    const msg = new Message({
      sender: req.user.user.id,
      content: blobUrl,
      chatRoom: req.params.chatRoomId,
      type: file.mimetype.startsWith("image") ? "image" : "file",
    });

    await msg.save();
    
    res.status(200).send({ url: blobUrl, type: msg.type, ...msg._doc });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).send('Error uploading file.');
  }
});

app.post('/forms/submit-form', upload.single('file'), authMiddleware, async (req, res) => {
  try {
    const form = await Form.findById(req.body.formId);
    if (!form) {
      return res.status(404).send({ message: 'Form not found' });
    }
    if (form.closeDate && new Date() > new Date(form.closeDate)) {
      return res.status(400).send({ message: 'Form submission closed' });
    }
    const response = new Response({
      formId: req.body.formId,
      userId: req.user.user.id,
    });

    for (let elementId in req.body.responses) {
      let value = req.body.responses[elementId];
      if (req.file && value === req.file.originalname) {
        const blobName = `${Date.now()}-${req.file.originalname}`;
        const blobUrl = await createBlobInContainer(blobName, req.file.buffer);
        value = blobUrl;
      }
      response.responses.push({ elementId, value });
    }

    await response.save();

    form.responses.push(response._id);
    await form.save();

    res.status(201).send({ message: 'Form submitted successfully', response });
  } catch (error) {
    console.error('Error submitting form:', error);
    res.status(500).send({ message: 'Error submitting form' });
  }
});

app.get("/",(req,res)=>{
  res.send("Server active");
})

app.use("/auth", authRouter);
app.use("/organization", orgRouter);
app.use("/team", teamRouter);
app.use("/project", projRouter);
app.use("/chat", chatRouter);
app.use("/meeting", meetingRouter);
app.use("/form", formRouter);

mongoose.connect(process.env.MONGO_URL)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

const handleError = (error) => {
  console.error("Unhandled error:", error);
};

// Global error handling for unhandled rejections and uncaught exceptions
process.on('unhandledRejection', handleError);
process.on('uncaughtException', handleError);

const port = process.env.PORT || 5000;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
