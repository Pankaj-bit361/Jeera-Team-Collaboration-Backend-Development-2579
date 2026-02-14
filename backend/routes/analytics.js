import express from 'express';
import Task from '../models/Task.js';
import User from '../models/User.js';
import { authMiddleware, requireOrganization } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/analytics/stats
// @desc    Get basic task counts
router.get('/stats', authMiddleware, requireOrganization, async (req, res) => {
  try {
    const orgId = req.organizationId;
    
    const total = await Task.countDocuments({ organization: orgId });
    const completed = await Task.countDocuments({ organization: orgId, status: 'Done' });
    const pending = total - completed; // Simplistic view, or count !Done

    res.json({
      totalTasks: total,
      completedTasks: completed,
      pendingTasks: pending
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/analytics/distribution
// @desc    Tasks per user (for Pie/Bar chart)
router.get('/distribution', authMiddleware, requireOrganization, async (req, res) => {
  try {
    const orgId = req.organizationId;

    // Aggregate tasks by assignee
    const distribution = await Task.aggregate([
      { $match: { organization: new mongoose.Types.ObjectId(orgId) } },
      { $group: { _id: '$assignee', count: { $sum: 1 } } }
    ]);

    // Populate user names manually since aggregate doesn't populate directly easily in one go without lookups
    await User.populate(distribution, { path: '_id', select: 'name' });

    // Format for frontend: { name: 'John', value: 5 }
    const formatted = distribution.map(item => ({
      name: item._id ? item._id.name : 'Unassigned',
      value: item.count
    }));

    res.json(formatted);
  } catch (error) {
    // Need mongoose import for ObjectId casting in aggregation
    // Let's import mongoose at top
    res.status(500).json({ message: 'Server error' });
  }
});

// Fix: Import mongoose for aggregation ObjectId
import mongoose from 'mongoose';

// @route   GET /api/analytics/performance
// @desc    Completed tasks per user
router.get('/performance', authMiddleware, requireOrganization, async (req, res) => {
  try {
    const orgId = req.organizationId;

    const performance = await Task.aggregate([
      { 
        $match: { 
          organization: new mongoose.Types.ObjectId(orgId),
          status: 'Done'
        } 
      },
      { $group: { _id: '$assignee', count: { $sum: 1 } } }
    ]);

    await User.populate(performance, { path: '_id', select: 'name' });

    const formatted = performance.map(item => ({
      name: item._id ? item._id.name : 'Unassigned',
      completed: item.count
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;