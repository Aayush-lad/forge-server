import express from "express";
import authMiddleware,{authorizeCreate, authorizeTeamMutate} from '../middlewares/auth.js'
import teamController from "../controllers/team.js";
const router = express.Router();

router.post("/:organizationId/create", authMiddleware,authorizeCreate,teamController.create );
router.get("/:organizationId/teams", authMiddleware, teamController.getTeams);
router.get("/:teamId/members",teamController.getMembers);
router.post("/:teamId/add-member",authMiddleware,authorizeTeamMutate,teamController.addMember)
router.delete("/:teamId/delete-member",authMiddleware,authorizeTeamMutate,teamController.deleteMember)
router.delete("/delete/:teamId",authMiddleware,authorizeTeamMutate, teamController.deleteTeam )
router.get("/:teamId", teamController.getTeamDetails);        

export default router;
