import express from "express";
import Team from "../models/team.js"
import User from "../models/user.js"
import Organization from "../models/organization.js"
import { ChatRoom } from "../models/chat.js";
import authMiddleware from '../middlewares/auth.js'
import Project from '../models/project.js'
import mongoose from "mongoose";
import teamController from "../controllers/team.js";

const router = express.Router();

// CREATE TEAM

router.post("/create", authMiddleware,teamController.create );
router.get("/:organizationId/teams", authMiddleware, teamController.getTeams);
router.get("/:teamId/members",teamController.getMembers);
router.post("/:teamId/add-member",teamController.addMember)
router.delete("/:teamId/delete-member",teamController.deleteMember)
router.delete("/delete/:teamId",teamController.deleteTeam )
router.get("/:teamId", teamController.getTeamDetails);        

export default router;