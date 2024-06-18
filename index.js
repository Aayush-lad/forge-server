// index.js for project management tool 

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import authRouter from "./routes/auth.js";
import orgRouter from "./routes/organization.js";
import bodyParser from "body-parser";
const app =express()

app.use(bodyParser.json());
app.use(express.json());
app.use(cors());



app.get("/", (req, res) => {
    res.send("Hello World");
    }
);

app.use("/auth",authRouter);
app.use("/organization",orgRouter);

mongoose.connect("mongodb://localhost:27017/foge-dev").then(() => {
    console.log("Connected to MongoDB");
}).catch((error) => {
    console.log("Error:", error);
});



app.listen(5000, () => {
    console.log("Server is running on port 5000");
});



