import express from 'express';
import Task from '../models/Task.js';
import { authMiddleware, requireOrganization } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/tasks
// @desc    Get all tasks for org (with filters)
router.get('/', authMiddleware, requireOrganization, async (req, res) => {
  const { status, priority } = req.query;
  
  const query = { organization: req.organizationId };
  if (status) query.status = status;
  if (priority) query.priority = priority;

  try {
    const tasks = await Task.find(query)
      .populate('assignee', 'name email')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/tasks/my-tasks
// @desc    Get tasks assigned to logged in user
router.get('/my-tasks', authMiddleware, requireOrganization, async (req, res) => {
  try {
    const tasks = await Task.find({
      organization: req.organizationId,
      assignee: req.user.userId
    })
    .populate('assignee', 'name email')
    .populate('createdBy', 'name')
    .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/tasks
// @desc    Create a task
router.post('/', authMiddleware, requireOrganization, async (req, res) => {
  const { title, description, status, priority, assignee } = req.body;

  try {
    const newTask = new Task({
      title,
      description,
      status,
      priority,
      assignee, // Expecting userId or null
      organization: req.organizationId,
      createdBy: req.user.userId
    });

    await newTask.save();
    
    // Populate for return
    const populatedTask = await Task.findById(newTask._id)
      .populate('assignee', 'name email')
      .populate('createdBy', 'name');

    res.status(201).json(populatedTask);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/tasks/:id
// @desc    Update a task
router.put('/:id', authMiddleware, requireOrganization, async (req, res) => {
  const { title, description, status, priority, assignee } = req.body;

  try {
    let task = await Task.findOne({ _id: req.params.id, organization: req.organizationId });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (status) task.status = status;
    if (priority) task.priority = priority;
    if (assignee !== undefined) task.assignee = assignee;

    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate('assignee', 'name email')
      .populate('createdBy', 'name');

    res.json(populatedTask);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete a task
router.delete('/:id', authMiddleware, requireOrganization, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, organization: req.organizationId });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    res.json({ message: 'Task removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/tasks/:id/comments
// @desc    Add comment to task
router.post('/:id/comments', authMiddleware, requireOrganization, async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ message: 'Comment text is required' });

  try {
    const task = await Task.findOne({ _id: req.params.id, organization: req.organizationId });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const newComment = {
      text,
      user: req.user.userId,
      createdAt: new Date()
    };

    task.comments.push(newComment);
    await task.save();

    // Re-fetch to populate comments user
    const updatedTask = await Task.findById(task._id)
      .populate('comments.user', 'name');

    res.json(updatedTask.comments);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;