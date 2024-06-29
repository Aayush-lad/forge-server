// index.js for project management tool 

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import authRouter from "./routes/auth.js";
import orgRouter from "./routes/organization.js";
import teamRouter from "./routes/team.js"
import projRouter from "./routes/project.js"
import http from "http";
// import socketHandler from "./utils/socket.js"
// import Redis from 'ioredis';
import { Server } from "socket.io";
import bodyParser from "body-parser";
// import { createAdapter } from "@socket.io/redis-adapter";
import chatRouter from './routes/chat.js';
import { Message,ChatRoom } from "./models/chat.js";


const app =express()
const server = http.createServer(app);

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

  socket.on('sendMessage', async ({ chatRoomId, senderId, content }) => {
    const message = new Message({ sender: senderId, content, chatRoom: chatRoomId });
    await message.save();
    io.to(chatRoomId).emit('receiveMessage', message);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});


 




app.use(bodyParser.json());
app.use(express.json());
app.use(cors());



app.get("/", (req, res) => {
    res.send("Hello World");
    }
);



app.use("/auth",authRouter);
app.use("/organization",orgRouter);
app.use("/team",teamRouter);
app.use("/project",projRouter);
app.use("/chat",chatRouter)

mongoose.connect("mongodb://localhost:27017/foge-dev").then(() => {
    console.log("Connected to MongoDB");
}).catch((error) => {
    console.log("Error:", error);
});



server.listen(5000, () => {
    console.log("Server is running on port 5000");
});



