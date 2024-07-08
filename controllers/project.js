import Project from "../models/project.js";
import User from "../models/user.js";
import Team from "../models/team.js";
import Task from "../models/task.js";
import { ChatRoom } from "../models/chat.js";

const create = async (req, res) => {

  const newProject = new Project(req.body);
  const { teamId } = req.body;
  try {
    const savedProject = await newProject.save();

    // add project to all members of team

    for (let teamid of teamId) {
      const team = await Team.findById(teamid);
      if (!team) {
        return res.json({ message: "Team not found", status: false });
      }
      for (let memberId of team.members) {
        const user = await User.findById(memberId);
        if (!user) {
          return res.json({ message: "User not found", status: false });
        }
        user.projects.push(savedProject._id);
        await user.save();

        // update project.members

        if (!savedProject.members.includes(user._id)) {
          savedProject.members.push(user._id);
        }
      }
    }

    await savedProject.save();

    // create chat room for project

    const chatRoom = new ChatRoom({
      projectId: savedProject._id,
      members: savedProject.members,
      isPrivate: false,
      name: savedProject.name,
    });

    await chatRoom.save();

    res.json({
      project: savedProject,
      message: "Project successfully created",
      status: true,
    });
  } catch (err) {
    console.log(err);
    res.json({ message: "Something went wrong", status: false });
  }
};

const deleteProject = async (req, res) => {
  const { projectId } = req.params;
  try {
    const project = await Project.findById(projectId);
    if (!project) {
      return res.json({ message: "Project not found", status: false });
    }
    for (let memberId of project.members) {
      const user = await User.findById(memberId);
      if (!user) {
        return res.json({ message: "User not found", status: false });
      }
      user.projects = user.projects.filter((item) => item != projectId);
      await user.save();
    }
    await await Project.findByIdAndDelete(projectId);
    res.json({ message: "Project successfully deleted", status: true });
  } catch (err) {
    console.log(err);
    res.json({ message: "Something went wrong", status: false });
  }
};

const addMember = async (req, res) => {

  const { projectId } = req.params;
  const { email } = req.body;
  try {
    const project = await Project.findById(projectId);

    if (!project) {
      return res.json({ message: "Project not found", status: false });
    }

    const user = await User.findOne({ email: email });

    if (!user) {
      return res.json({ message: "User not found", status: false });
    }

    if (project.members.includes(user._id)) {
      return res.json({ message: "User already in project", status: false });
    }
    project.members.push(user._id);
    user.projects.push(project._id);
    await project.save();
    await user.save();
    res.json({ message: "User added successfully", status: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error", error });
  }
};

const removeMember = async (req, res) => {
  const { projectId } = req.params;
  const { email } = req.body;
  try {
    const project = await Project.findById(projectId);
    if (!project) {
      return res.json({ message: "Project not found", status: false });
    }
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.json({ message: "User not found", status: false });
    }
    const userId = user._id;

    project.members = project.members.filter(
      (item) => item != userId.toString()
    );
    user.projects = user.projects.filter((item) => item != projectId);
    await project.save();
    await user.save();
    res.json({ message: "User removed successfully", status: true, project });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error", error });
  }
};

const assignProject = async (req, res) => {
  const { projectId } = req.params;
  const { teamId } = req.body;
  try {
    const project = await Project.findById(projectId);
    if (!project) {
      return res.json({ message: "Project not found", status: false });
    }
    for (let teamid of teamId) {
      const team = await Team.findById(teamid);
      if (!team) {
        return res.json({ message: "Team not found", status: false });
      }
      for (let memberId of team.members) {
        const user = await User.findById(memberId);
        if (!user) {
          return res.json({ message: "User not found", status: false });
        }
        user.projects.push(project._id);
        await user.save();
        //  update project.members

        if (!project.members.includes(user._id)) {
          project.members.push(user._id);
        }
      }
    }

    await project.save();
    res.json({ message: "Teams added successfully", status: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error", error });
  }
};

const addTask = async (req, res) => {
  const { projectId } = req.params;

  const newTask = new Task({ ...req.body, projectId: projectId });
 
  try {
    const project = await Project.findById(projectId);
    if (!project) {
      return res.json({ message: "Project not found", status: false });
    }
    const savedTask = await newTask.save();
    project.tasks.push(savedTask._id);
    await project.save();
    res.json({ message: "Task added successfully", status: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error", error });
  }
};

const getAllTasks = async (req, res) => {
  const { projectId } = req.params;
  try {
    const project = await Project.findById(projectId);
    if (!project) {
      return res.json({ message: "Project not found", status: false });
    }

    const tasks = await Task.find({ projectId: projectId });
  
    res.json({ tasks, message: "Tasks fetched successfully", status: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error", error });
  }
};

const deleteTask = async (req, res) => {
  const { projectId, taskId } = req.params;
  try {
    const project = await Project.findBy(projectId);

    if (!project) {
      return res.json({ message: "Project was not found", status: false });
    }

    const task = Task.findById(taskId);

    if (!task) {
      return res.json({ message: "Task was not found", status: false });
    }

    //  update user

    for (let assignee of task.assignees) {
      const user = await User.findById(assignee);
      if (user) {
        user.tasks = user.tasks.filter((item) => item != taskId);
        await user.save();
      }
    }
    await task.delete();
    project.tasks = project.tasks.filter((item) => item != taskId);
    await project.save();
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error", error });
  }
};

const updateTask = async (req, res) => {
  const { projectId, taskId } = req.params;
  const {
    title,
    description,
    status,
    priority,
    startDate,
    endDate,
    timeLogged,
    comments,
    attachments,
  } = req.body;
  try {
    const project = await Project.findBy(projectId);
    if (!project) {
      return res.json({ message: "Project was not found", status: false });
    }
    const task = Task.findById();
    if (!task) {
      return res.json({ message: "Task was not found", status: false });
    }
    task.title = title;
    task.description = description;
    task.status = status;
    task.priority = priority;
    task.startDate = startDate;
    task.endDate = endDate;
    task.timeLogged = timeLogged;
    task.comments = comments;
    task.attachments = attachments;

    await task.save();
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error", error });
  }
};

const getOrgProjects = async (req, res) => {
  const { organizationId } = req.params;
  try {
    const projects = await Project.find({ organizationId: organizationId });

    res.json({
      projects,
      message: "Projects fetched successfully",
      status: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error", error });
  }
};

const getUserProjects = async (req, res) => {
  const { userId, organizationId } = req.params;
  try {
    const projects = await Project.find({ organizationId: organizationId });
    const userProjects = projects.filter((project) =>
      project.members.includes(userId)
    );
    res.json({
      projects: userProjects,
      message: "Projects fetched successfully",
      status: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error", error });
  }
};

const getTeamProjects = async (req, res) => {
  const { teamId } = req.params;
  try {
    const projects = await Project.find({ teamId: teamId });
    res.json({
      projects,
      message: "Projects fetched successfully",
      status: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error", error });
  }
};

const getDetails = async (req, res) => {
  const { projectId } = req.params;
  try {
    const project = await Project.findById(projectId)
      .populate("members")
      .populate("tasks");
    res.json({
      project,
      message: "Project fetched successfully",
      status: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error", error });
  }
};

const updateTaskStatus = async (req, res) => {

  const { projectId, taskId } = req.params;
  const { status } = req.body;
  try {
    const project = await Project.findById(projectId);
    if (!project) {
      return res.json({ message: "Project not found", status: false });
    }
    const task = await Task.findById(taskId);
    if (!task) {
      return res.json({ message: "Task not found", status: false });
    }
    task.status = status;
    await task.save();
    res.json({ message: "Task status updated successfully", status: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error", error });
  }
};

export default {
  create,
  deleteProject,
  deleteTask,
  getAllTasks,
  getDetails,
  getOrgProjects,
  getUserProjects,
  getTeamProjects,
  updateTask,
  updateTaskStatus,
  addMember,
  removeMember,
  assignProject,
  addTask,
};
