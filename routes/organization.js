import express from 'express';
import Organization from '../models/organization.js';
import User from '../models/user.js';
import auth from '../middlewares/auth.js';

const router = express.Router();

router.post('/create',auth, async (req, res) => {
  const userId = req.user.user.id;
  const { name } = req.body;
  if (!name ) {
    return res.status(400).json({ error: 'Name is required' });
  }

  try {
    // Create the organization
    const organization = new Organization({ name });
    await organization.save();

    // Find the user
    const user = await User.findById(userId)

    console.log(user);
    if (!user) {
      return res.json({ error: 'User not found' });
    }

    // Add user to organization members with admin role
    organization.members.push(user._id);
    await organization.save();

    if(!user.roles){
      user.roles = [];
    }

    // Update user's roles
    user.roles.push({ organizationId: organization._id, role: 'Admin' });
    await user.save();

    res.json({ message: 'Organization created successfully', organization });
  } catch (error) {

    console.log(error);
    res.json({ error: 'Internal server error' });
  }
});

export default router;
