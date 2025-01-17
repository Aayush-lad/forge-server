import Team from "../models/team.js"
import Project from "../models/project.js"
import Organization from "../models/organization.js";
import User from "../models/user.js";
import {ChatRoom} from '../models/chat.js'

const create = async (req, res) => {
    const { name, organizationId } = req.body;
    console.log('creating team');    
    if (!name || !organizationId) {
        return res.json({ message : "Name and organizationId are required",status:false });
    }
    try {
        const team = new Team({ name, organizationId: organizationId });
        if (!team.members) {
            team.members = [];
        }

        if (req.body.memberIds) {
            team.members = [...team.members, ...req.body.memberIds];
        }
        for (let memberId of team.members) {
            const user = await User.findById(memberId);
            if (!user) {
                return res.json({ message: "User not found", status: false });
            }
            user.teams.push(team._id);
            await user.save();
        }
        const creator = await User.findOne({ email: req.user.user.email }); // Await the resolution of findOne
        if (!team.members.includes(creator._id)) {
            team.members.push(creator._id);
            
            if (!creator.teams) {
                creator.teams = [];
            }
            creator.teams.push(team._id);
            await creator.save();
        }

        await team.save();  
        
        const chatRoom = new ChatRoom({ name: team.name, members: team.members, teamId: team._id, isPrivate: false });
        await chatRoom.save();

        res.json({ message: "Team created successfully", team });

    } catch (error) {
        console.log(error);
        res.json({ error: "Internal server error" });
    }
}

const getTeamDetails= async (req, res) => {
    const { teamId } = req.params;
    try {
        const team = await Team.findById(teamId);
        if(!team){
            return res.json({message:"Team not found",status:false});
        }
        const projects = await Project.find({ teamId: teamId });
        const response ={...team,projects:projects}
        res.json(response);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error', error });
    }
}

const deleteTeam =async (req, res) => {
    const { teamId } = req.params;
    console.log("deleting ",teamId);
    try {
        const team = await Team.findById(teamId);
        if(!team){
            return res.json({message:"Team not found",status:false});
        }

        for(let memberId of team.members){
            const user = await User.findById(memberId);
            if(!user){
                return res.json({message:"User not found",status:false});
            }
            user.teams = user.teams.filter(teamId => teamId.toString() !== team._id.toString())
            await user.save();
        }
        // remove team from organization
        const organization = await Organization.findById(team.organizationId);
        if(!organization){
            return res.json({message:"Organization not found",status:false});
        }
        organization.teams = organization.teams.filter(teamId => teamId.toString() !== team._id.toString());
        await organization.save();
        await Team.findByIdAndDelete(teamId);
        res.json({message:"Team deleted successfully",status:true});
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error', error });
    }
}

const deleteMember = async (req, res) => {
    const { teamId } = req.params;
    const { email } = req.body;
    console.log(teamId,email);
    try {
        const team = await Team.findById(teamId);
        if(!team){
            console.log("Team not found")
            return res.json({message:"Team not found",status:false});
        }
        const user = await User.findOne({email:email});
        if(!user){
            console.log("user not found")
            return res.json({message:"User not found",status:false});
        }
        if(!team.members.includes(user._id)){
            console.log("user not in team")
            return res.json({message:"User not in team",status:false});
        }
        team.members = team.members.filter(memberId => memberId.toString() !== user._id.toString());
        user.teams = user.teams.filter(teamId => teamId.toString() !== team._id.toString())
        await team.save();
        await user.save();
        res.json({message:"User deleted successfully",status:true});
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error', error });
    }
}

const addMember = async (req, res) => {
    const { teamId } = req.params;
    const { email } = req.body;
    console.log(teamId,email);
    try {
        const team = await Team.findById(teamId);
        if(!team){
            return res.json({message:"Team not found",status:false});
        }

        const user = await User.findOne({email:email})

        if(!user){
            return res.json({message:"User not found",status:false});
        }

        if(team.members.includes(user._id)){
            return res.json({message:"User already in team",status:false});
        }
        team.members.push(user._id);
        user.teams.push(team._id);
        await team.save();
        await user.save();
        res.json({message:"User added successfully",status:true});

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error', error });
    }
}

const getMembers = async (req, res) => {
    const { teamId } = req.params;
    try {
        //  get all members of teamId with their  user._id name email role
        const team = await Team.findById(teamId);
        if(!team){
            return res.json({message:"Team not found",status:false});
        }
        const members = await User.find({ _id: { $in: team.members } }, 'username email ').populate({
            path:"projects",
            select:"name"
        }
        );
        const response = members.map((user) => {
            return {
              _id: user._id,
              username: user.username,
              email: user.email,
              projects: user.projects.map((project) => project.name), // Only names of filtered projects
            };
        });



        res.json(response);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error', error });
    }
}

const getTeams = async (req, res) => {
    const { organizationId } = req.params;
    console.log(req.user.user.id);
    if (!organizationId) {
      return res.json({ message: "OrganizationId is required", status: false });
    }
    try {
      const user = await User.findById(req.user.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found', status: false });
      }
      const teams = await Team.find({ organizationId });
      const response = [];
      for (let team of teams) {
        if (!team.members) {
          continue;
        }
        if (team.members.includes(user._id)) {
          response.push(team);
        }
      }
      console.log(response);
      res.json(response);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Server error', error });
    }
  }

export default{
    getTeamDetails,
    deleteTeam,
    deleteMember,
    addMember,
    getMembers,
    getTeams,
    create,
}