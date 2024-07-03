// index.js for project management tool 

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import authRouter from "./routes/auth.js";
import orgRouter from "./routes/organization.js";
import teamRouter from "./routes/team.js"
import projRouter from "./routes/project.js"
import http from "http";
// import Redis from 'ioredis';
import { Server } from "socket.io";
import bodyParser from "body-parser";
// import { createAdapter } from "@socket.io/redis-adapter";
import chatRouter from './routes/chat.js';
import { Message,ChatRoom } from "./models/chat.js";
import path from "path";
import {BlobServiceClient} from "@azure/storage-blob"
import multer from "multer";
import authMiddleware from "./middlewares/auth.js";
import meetingRouter from "./routes/meeting.js";







const app =express()
const server = http.createServer(app);
const upload = multer();


const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});


io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('joinRoom', ({ chatRoomId }) => {
    socket.join(chatRoomId);
  });

  socket.on('sendMessage', async (msg) => {
    console.log("Inserver send message",msg);
    const { senderId, content, chatRoomId,type } = msg;
    let message = null
    if(type == 'text'){
    message = new Message({ sender: senderId, content, chatRoom: chatRoomId,type:type });
    await message.save();
    }
    else{
      message = msg;
    }
    console.log("emitting",message);
    io.to(chatRoomId).emit('receiveMessage', message);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});


app.use(bodyParser.json());
app.use(express.json());
app.use(cors());




const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_BLOB_CONNECTION_STRING);
const containerClient = blobServiceClient.getContainerClient(process.env.CONTAINER);

const createBlobInContainer = async (blobName, buffer) => {
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  await blockBlobClient.uploadData(buffer);
  return blockBlobClient.url;
};

app.post('/upload/:chatRoomId',authMiddleware, upload.single('file'), async (req, res) => 
  {
    console.log(req.user.user);
  try {
    const file = req.file;
    console.log(file);
    if (!file) {
      return res.status(400).send('No file uploaded.');
    }

    const blobName = `${Date.now()}-${file.originalname}`;
    const blobUrl = await createBlobInContainer(blobName, file.buffer);
    

    // store message in db

    const msg =  new Message({
      sender: req.user.user.id,
      content: blobUrl,
      chatRoom: req.params.chatRoomId,
      type: file.mimetype.startsWith("image")?"image":"file",
    });

    const type =  file.mimetype.startsWith("image")?"image":"file"

    await msg.save();
    
    res.status(200).send({ url: blobUrl,type:type,...msg });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).send('Error uploading file.');
  }
});



app.get("/", (req, res) => {
    res.send("Hello World");
    }
);



app.use("/auth",authRouter);
app.use("/organization",orgRouter);
app.use("/team",teamRouter);
app.use("/project",projRouter);
app.use("/chat",chatRouter)
app.use("/meeting",meetingRouter);


mongoose.connect("mongodb://localhost:27017/foge-dev").then(() => {
    console.log("Connected to MongoDB");
}).catch((error) => {
    console.log("Error:", error);
});



server.listen(5000, () => {
    console.log("Server is running on port 5000");
});



