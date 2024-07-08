import express from "express"
import projectController from "../controllers/project.js";



const router = express.Router();


router.post("/create",projectController.create );
router.delete("/delete/:projectId", projectController.deleteProject);
router.post("/:projectId/add-member", projectController.addMember);
router.delete("/:projectId/delete-member", projectController.removeMember);
router.post("/:projectId/assign-teams",projectController.assignProject);
router.post("/:projectId/add-task",projectController.addTask )
router.get("/:projectId/tasks",projectController.getAllTasks);
router.delete("/:projectId/delete-task/:taskId",projectController.deleteTask)
router.put("/:projectId/update-task/:taskId",projectController.updateTask );
router.get("/organization/:organizationId",projectController.getOrgProjects);
router.get("/team/:teamId",projectController.getTeamProjects );
router.get("/:organizationId/:userId",projectController.getUserProjects);
router.get("/:projectId", projectController.getDetails);
router.put("/:projectId/update-task-status/:taskId",projectController.updateTaskStatus );



export default router;