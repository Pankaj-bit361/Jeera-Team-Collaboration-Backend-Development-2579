import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import Organization from '../models/Organization.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Helper to generate Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// @route   POST /api/auth/signup
// @desc    Register a user (Create Org, Join by Code, or Auto-Join invited)
router.post('/signup', async (req, res) => {
  const { name, email, password, orgName, inviteCode } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user = new User({
      name,
      email,
      password: hashedPassword,
      organizations: []
    });

    await user.save();

    // 1. Auto-join organizations where this email was invited
    const invitedOrgs = await Organization.find({ pendingInvites: email });
    
    for (const org of invitedOrgs) {
      org.members.push(user._id);
      org.pendingInvites = org.pendingInvites.filter(e => e !== email);
      await org.save();
      user.organizations.push(org._id);
    }

    // 2. Join specific organization via code if provided
    if (inviteCode) {
      const orgToJoin = await Organization.findOne({ inviteCode });
      if (orgToJoin) {
        // Prevent duplicate join if also in invitedOrgs
        if (!user.organizations.includes(orgToJoin._id)) {
           orgToJoin.members.push(user._id);
           await orgToJoin.save();
           user.organizations.push(orgToJoin._id);
        }
      }
    }

    // 3. Create new organization if orgName provided
    if (orgName) {
      const newInviteCode = crypto.randomBytes(4).toString('hex').toUpperCase();
      const newOrg = new Organization({
        name: orgName,
        inviteCode: newInviteCode,
        owner: user._id,
        members: [user._id]
      });
      await newOrg.save();
      user.organizations.push(newOrg._id);
    }

    await user.save();

    const token = generateToken(user._id);

    // Fetch updated user with populated orgs
    const populatedUser = await User.findById(user._id).populate('organizations').select('-password');

    res.status(201).json({
      token,
      user: populatedUser
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/login
// @desc    Login user & get token
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);
    const populatedUser = await User.findById(user._id).populate('organizations').select('-password');

    res.json({
      token,
      user: populatedUser
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user info
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate('organizations').select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;