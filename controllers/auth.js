import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import bcrypt from "bcryptjs"
const router = express.Router();
import dotenv from  "dotenv"

dotenv.config()


const register = async (req, res) => {
    const {username,password,email} = req.body;
    try {
      let user = await User.findOne({username });
  
      let emailUnique = await User.findOne({email});
      if (user || emailUnique) {
        return res.json({ message: 'User already exists',status:false });
      }
  
      user = new User({ email, password,username });
      await user.save();
      const payload = {
        user: {
          id: user._id,
          username: user.username,
          role: user.role,
          email:user.email
        }
      };
  
      jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
        if (err) throw err;
        res.json({ token,status:true });
      });
  
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ message: 'Server Error',status:"false" });
    }
  }


  const login = async (req, res) => {
    const {email, password } = req.body;
    console.log(req.body);
    try {
      let user = await User.findOne({ email });
      if (!user) {
         console.log(user)
        return res.json({ message: 'Invalid credentials',status:false });
      }
  
      const isMatch = await user.comparePassword(password);
      console.log(isMatch);
  
  
      if (isMatch == false) {
        console.log("Inside");
        return res.json({ message: 'Invalid credentials',status:false });
      }
  
      const payload = {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          username:user.username
        }
      };

      const data = {
        id: user.id,
        email: user.email,
        roles: user.roles,
        username:user.username,
        projects:user.projects,
        tasks:user.tasks,
        
        
      }
  
      jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
        if (err) throw err;
        res.json({ token , status:true});
      });
  
    } catch (error) {
      console.error(error.message);
      return res.status(500).json({status:false, message:error.message});
    }
  }


  const getUser = async(req,res)=>{
    try {
      const user = await User.findById(req.user.id).select('-password');
      res.json(user);
      } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server Error' });
      }
  }




export default {
    register,
    login,
    getUser
}