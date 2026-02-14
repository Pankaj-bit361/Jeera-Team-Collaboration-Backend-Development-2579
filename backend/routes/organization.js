import express from 'express';
import crypto from 'crypto';
import axios from 'axios';
import Organization from '../models/Organization.js';
import User from '../models/User.js';
import { authMiddleware, requireOrganization } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/organizations
// @desc    Get all organizations for current user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate('organizations');
    res.json(user.organizations);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/organizations
// @desc    Create a new organization
router.post('/', authMiddleware, async (req, res) => {
  const { name } = req.body;
  
  if (!name) return res.status(400).json({ message: 'Organization name is required' });

  try {
    const inviteCode = crypto.randomBytes(4).toString('hex').toUpperCase(); // 8 char code
    
    const newOrg = new Organization({
      name,
      inviteCode,
      owner: req.user.userId,
      members: [req.user.userId]
    });

    await newOrg.save();

    // Add to user's org list
    await User.findByIdAndUpdate(req.user.userId, {
      $push: { organizations: newOrg._id }
    });

    res.status(201).json(newOrg);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/organizations/join
// @desc    Join organization via invite code
router.post('/join', authMiddleware, async (req, res) => {
  const { inviteCode } = req.body;

  try {
    const org = await Organization.findOne({ inviteCode });
    if (!org) {
      return res.status(404).json({ message: 'Organization not found with this code' });
    }

    if (org.members.includes(req.user.userId)) {
      return res.status(400).json({ message: 'You are already a member' });
    }

    org.members.push(req.user.userId);
    await org.save();

    await User.findByIdAndUpdate(req.user.userId, {
      $push: { organizations: org._id }
    });

    res.json(org);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/organizations/members
// @desc    Get members of current organization
router.get('/members', authMiddleware, requireOrganization, async (req, res) => {
  try {
    const org = await Organization.findById(req.organizationId)
      .populate('members', 'name email _id')
      .select('members pendingInvites');
    
    res.json({
      members: org.members,
      pendingInvites: org.pendingInvites
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/organizations/invite
// @desc    Invite user to organization
router.post('/invite', authMiddleware, requireOrganization, async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  try {
    const org = await Organization.findById(req.organizationId);
    
    // Check if already a member
    const existingUser = await User.findOne({ email });
    
    if (existingUser && org.members.includes(existingUser._id)) {
      return res.status(400).json({ message: 'User is already a member' });
    }

    if (org.pendingInvites.includes(email)) {
      return res.status(400).json({ message: 'Invite already sent to this email' });
    }

    // Logic: If user exists, add them directly? 
    // Requirement says: "If user exists → directly add"
    // However, usually it's safer to still require acceptance or just notify. 
    // But per requirements: "If user exists → directly add"
    
    if (existingUser) {
      org.members.push(existingUser._id);
      await org.save();
      
      // Update user's org list
      if (!existingUser.organizations.includes(org._id)) {
        existingUser.organizations.push(org._id);
        await existingUser.save();
      }

      // Send accepted email notification (optional but good UX)
    } else {
      // User doesn't exist, add to pending
      org.pendingInvites.push(email);
      await org.save();
    }

    // Send Invitation Email via External API
    // POST https://hackathon.velosapps.com/api/email/send
    try {
      const inviteLink = `https://jeera-app.com/signup?code=${org.inviteCode}`; // Placeholder frontend URL
      
      await axios.post('https://hackathon.velosapps.com/api/email/send', {
        to: email,
        subject: `You've been invited to join ${org.name} on Jeera`,
        body: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h1>Welcome to Jeera!</h1>
            <p>You have been invited to join the organization <strong>${org.name}</strong>.</p>
            <p>Use the invite code below to join:</p>
            <h2 style="background: #f4f4f4; padding: 10px; display: inline-block;">${org.inviteCode}</h2>
            <br/>
            <a href="${inviteLink}" style="display: inline-block; background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">Join Now</a>
          </div>
        `
      });
    } catch (emailErr) {
      console.error('Failed to send email:', emailErr.message);
      // Don't fail the request if email fails, just log it.
    }

    res.json({ message: existingUser ? 'User added to organization' : 'Invitation sent successfully' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;