import jwt from "jsonwebtoken"
import dotenv from "dotenv";
import User from "../models/user.js";
import Project from "../models/project.js";
import Team from "../models/team.js";


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

export const  authorizeOrgMemberMutate = async(req,res,next)=>{
  try{
let {organizationId} = req.params;
if(!organizationId){
  organizationId = req.body.organizationId;
}

  const userId = req.user.user.id;
  const user = await User.findOne({
    _id: userId,
    roles: {
      $elemMatch: {
        organizationId: organizationId,
        role: 'Admin'
      }
    }
  });


    if(!user){
        return res.json({ message: 'You are not authorized . You need to be ADMIN to perform this action ', status:false });
    }
    else{
      next();
    }
  }

  catch{
    console.log(error);
    return res.status(501).json({message:"Something went wrong"})
  }
}

export const authorizeTeamMutate = async(req,res,next)=>{
  try{
  const {teamId} = req.params;
 
  const  team = await Team.findById(teamId);
  const organizationId = team.organizationId;

    const userId = req.user.user.id;
    const user = await User.findOne({
      _id: userId,
      roles: {
        $elemMatch: {
          organizationId: organizationId,
          role:  { $in: ['Admin', 'ProjectManager'] }
        }
      }
    });
  
      if(!user){
          return res.json({ message: 'You are not authorized . You need to have atleast PROJECT MANAGER privilege to perform this action ', status:false });
      }
      else{
        next();
      }
    }
    catch(error){
      console.log(error);
      return res.status(501).json({message:"Server error"});
    }

}



export const authorizeProjectMutate = async(req,res,next)=>{
  try{
  const {projectId} = req.params;

  const  project = await Project.findById(projectId);
  const organizationId = project.organizationId;

    const userId = req.user.user.id;
    const user = await User.findOne({
      _id: userId,
      roles: {
        $elemMatch: {
          organizationId: organizationId,
          role:  { $in: ['Admin', 'ProjectManager'] }
        }
      }
    });
  

      if(!user){
          return res.json({ message: 'You are not authorized . You need to have atleast PROJECT MANAGER privilege to perform this action ', status:false });
      }
      else{
        next();
      }
    }
    catch{
      console.log(error);
      return res.status(501).json({message:"Server Error"});
    }

}

export const authorizeCreate = async(req,res,next)=>{

  try{
  const {organizationId} = req.params;

    const userId = req.user.user.id;
    const user = await User.findOne({
      _id: userId,
      roles: {
        $elemMatch: {
          organizationId: organizationId,
          role:  { $in: ['Admin', 'ProjectManager'] }
        }
      }
    });
      if(!user){
          return res.json({ message: 'You are not authorized . You need to have atleast PROJECT MANAGER privilege to perform this action ', status:false });
      }
      else{
        next();
      }
  }
  catch(err){
    return res.status(501).json({message:"Server Error"});

  }

}


