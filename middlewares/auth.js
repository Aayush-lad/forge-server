import jwt from "jsonwebtoken"
import dotenv from "dotenv";
import User from "../models/user.js";
import mongoose from "mongoose";


dotenv.config();

export default function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  
  if (!token) {
  return res.status(401).json({ message: 'You are not authorized' });
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
  if (err) {
  return res.json({ message: 'You are not authorized',status:false });
  }
  req.user = user;
  next();
  });
}

export const  authorizeOrgMemberMutate = (req,res,next)=>{
  const {organizationId} = req.params;
  const userId = req.user.user.id;
  const user  = User.findOne({
    _id:userId,
      'roles.organizationId': organizationId,
      'roles.role': 'Admin'
    })
    if(!user){
        return res.json({ message: 'You are not authorized', status:false });
    }
    else{
      next();
    }
}