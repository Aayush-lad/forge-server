// routes/auth.js
import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import bcrypt from "bcryptjs"
const router = express.Router();
import dotenv from  "dotenv"
import auth from '../controllers/auth.js';
import authMiddleware from '../middlewares/auth.js'


dotenv.config()


router.post('/register', auth.register);
router.post('/login',auth.login);
router.get("/user",authMiddleware, auth.getUser);

export default router;
