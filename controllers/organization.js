import Organization from "../models/organization.js";
import User from "../models/user.js";
import Team from "../models/team.js";
import Project from "../models/project.js";
import passgen from "crypto-random-string";
import mail from "../utils/email.js";

const getOrgMembers = async (req, res) => {
  const { organizationId } = req.params;
  try {
    const members = await User.find({ "roles.organizationId": organizationId })
      .populate({
        path: "teams",
        match: { organizationId }, // Ensure only teams belonging to the organization are populated
        select: "name", // Only select the name field
      })
      .populate({
        path: "projects",
        match: { organizationId }, // Ensure only projects belonging to the organization are populated
        select: "name", // Only select the name field
      });

    const response = members.map((user) => {
      const role = user.roles.find(
        (r) => r.organizationId.toString() === organizationId
      );
      return {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: role ? role.role : null,
        teams: user.teams.map((team) => team.name), // Only names of filtered teams
        projects: user.projects.map((project) => project.name), // Only names of filtered projects
      };
    });

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", status: false });
  }
};

const createOrg = async (req, res) => {
  const userId = req.user.user.id;
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Name is required" });
  }
  try {
    const organization = new Organization({ name });
    await organization.save();
    const user = await User.findById(userId);
    console.log(user);
    if (!user) {
      return res.json({ error: "User not found" });
    }
    organization.members.push(user._id);
    await organization.save();
    if (!user.roles) {
      user.roles = [];
    }
    user.roles.push({ organizationId: organization._id, role: "Admin" });
    await user.save();
    res.json({ message: "Organization created successfully", organization });
  } catch (error) {
    console.log(error);
    res.json({ error: "Internal server error" });
  }
};

const addMembers = async (req, res) => {
  const userId = req.user.user.id;
  const { email, role, organizationId } = req.body;
  if (!email || !role || !organizationId) {
    return res.json({
      message: "Email, role and organizationId are required",
      status: false,
    });
  }

  try {
    // Find the organization
    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return res.json({ message: "Organization not found", status: false });
    }

    // Check if the user is already a member of the organization

    let user = await User.findOne({ email });

    console.log(user);

    if (user) {
      const userInOrganization = organization.members.includes(user._id);
      if (userInOrganization) {
        return res.json({
          message: "User is already a member of the organization",
          status: false,
        });
      }
    }

    // Find the user

    let temp_password = "cbdhcwncejefvre";
    if (!user) {
      temp_password = passgen({ length: 8 });
      const username = email.split("@")[0];
      user = new User({ email, password: temp_password, username });
      await user.save();
    }

    // Add user to organization members
    organization.members.push(user.id);
    await organization.save();

    // Update user's roles

    user.roles.push({ organizationId, role });
    await user.save();

    res.json({
      message: "Member added successfully",
      status: true,
      organization,
    });
    // Send invitation email
    await mail.sendInvitationEmail(email, organization.name, temp_password);
  } catch (error) {
    console.error("Error adding member:", error);
    res.status(500).json({ message: "Internal server error", status: false });
  }
};

const deleteMember = async (req, res) => {


  console.log(req.body);
  const { organizationId } = req.params;
  const { email} = req.body;

  console.log(req.params)
  try {
    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return res.json({ message: "Organization not found", status: false });
    }

    let user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: "User not found", status: false });
    }
    const userInOrganization = organization.members.includes(user._id);

    if (!userInOrganization) {
      return res.json({
        message: "User is not a member of the organization",
        status: false,
      });
    }

    organization.members = organization.members.filter(
      (member) => member.toString() !== user._id.toString()
    );

    await organization.save();

    // remove from teams within the organization

    const teams = await Team.find({ organizationId });
    for (let team of teams) {
      team.members = team.members.filter(
        (member) => member.toString() !== user._id.toString()
      );
      await team.save();
    }

    // remove user from projects within the organization

    const projects = await Project.find({ organizationId });

    for (let project of projects) {
      project.members = project.members.filter(
        (member) => member.toString() !== user._id.toString()
      );
      await project.save();
    }
    // update user
    user.roles = user.roles.filter(
      (role) => role.organizationId.toString() !== organizationId.toString()
    );
    await user.save();

    res.json({ message: "Member deleted successfully", status: true });
  } catch {
    console.error(error);
    res.json({ message: "Internal server error", status: false });
  }
};

const editUserRole =async(req,res)=>{

  const {organizationId} = req.params;
  const {email} = req.body;

  try{
    const user = await User.findOne({email});

    if(!user){
      return res.json({message:"User not found",status:false})
    }

    const organization = await Organization.findById(organizationId);

    if(!organization){
      return res.json({message:"Organization not found",status:false})
    }

    console.log(user._id);

    const userInOrganization = organization.members.includes(user._id);
    console.log(userInOrganization);
  
    if (!userInOrganization) {
      console.log("not in org");
      return res.json({
        message: "User is not a member of the organization",
        status: false,
      });
    }

    //  update user roles
    user.roles = user.roles.map((role)=>{
      if(role.organizationId.toString() === organizationId){
        role.role = req.body.role;
      }
      return role;
    })

    await user.save();
    res.json({message:"User role updated successfully",status:true})
  }
  catch(error){
    console.error(error);
    res.json({message:"Internal server error",status:false})
  }
}


// get all organization of user

const getAll = async (req, res) => {

  const userId = req.user.user.id;

  try {
    const organizations = await Organization.find({ members: userId },"_id name createdAt ");
    res.json({organizations, status:true});
  }

  catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", status: false });
  }
}

//  delete organization

const deleteOrganization = async (req, res) => {
  const { organizationId } = req.params;

  console.log(organizationId);
  try {
    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return res.json({ message: "Organization not found", status: false });
    }


    // remove all teams  of that organization
    await Team.deleteMany({ organizationId: organizationId });
    // remove all projects of that organization

    await Project.deleteMany({organizationId:organizationId});

    // update user roles of that organization

    await User.updateMany(
      { "roles.organizationId": organizationId },
      { $pull: { roles: { organizationId } } }
    );

    await Organization.findByIdAndDelete(organizationId);


    res.json({ message: "Organization deleted successfully", status: true });

  } catch (error) {
    console.log(error);
    res.json({message:"Server error", status: false});
  }
}

const csvcreateOrg = async (req, res) => {
  const userId = req.user.user.id;
  const { organization, members } = req.body;

  // Validate organization name
  if (!organization) {
    return res.status(400).json({ error: "Organization name is required" });
  }

  try {
    // Create new organization
    const newOrganization = new Organization({ name: organization });
    const user = await User.findById(userId);

    // Check if user exists
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Add user as admin to the organization
    newOrganization.members.push(user._id);
    await newOrganization.save();

    // Assign admin role to the user for this organization
    if (!user.roles) {
      user.roles = [];
    }
    user.roles.push({ organizationId: newOrganization._id, role: "Admin" });
    await user.save();

    // Process each member from CSV data
    for (let member of members) {
      const { email, role } = member;

      // Validate email and role
      if (!email || !role) {
        continue; // Skip iteration if email or role is missing
      }

      // Generate temporary password for new users
      let temp_password = "cbdhcwncej"; // Default temporary password, consider using a secure method to generate passwords

      // Check if user already exists by email
      let existingUser = await User.findOne({ email });

      // If user doesn't exist, create a new user
      if (!existingUser) {
        temp_password = passgen({ length: 8 }); // Generate temporary password
        existingUser = new User({ email, password: temp_password, username: email.split("@")[0] });

        // Send invitation email with temporary password
        await mail.sendInvitationEmail(email, organization, temp_password);
      }

      // Add user to organization members
      newOrganization.members.push(existingUser._id);

      // Assign role to the user for this organization
      if (!existingUser.roles) {
        existingUser.roles = [];
      }
      existingUser.roles.push({ organizationId: newOrganization._id, role });

      // Save user and organization changes
      await existingUser.save();
      await newOrganization.save();
    }

    // Return success message and organization details
    res.json({ message: "Organization created successfully", organization: newOrganization });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};



export default {
  getOrgMembers,
  createOrg,
  addMembers,
  deleteMember,
  editUserRole,
  getAll,
  deleteOrganization,
  csvcreateOrg
};
