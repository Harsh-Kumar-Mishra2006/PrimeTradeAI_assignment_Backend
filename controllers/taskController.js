const Task = require('../models/Task');
const { validationResult } = require('express-validator');

const createTask = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const task = await Task.create({
      ...req.body,
      user: req.user.id,
    });
    
    res.status(201).json({ 
      success: true, 
      task 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

const getTasks = async (req, res) => {
  try {
    const { status, priority, page = 1, limit = 10 } = req.query;
    const query = {};
    
    // Filter by user role
    if (req.user.role !== 'admin') {
      query.user = req.user.id;
    }
    
    // Apply filters
    if (status) query.status = status;
    if (priority) query.priority = priority;
    
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;
    
    const tasks = await Task.find(query)
      .sort('-createdAt')
      .skip(skip)
      .limit(limitNumber)
      .populate('user', 'username email');
    
    const total = await Task.countDocuments(query);
    
    res.json({ 
      success: true, 
      count: tasks.length,
      total,
      page: pageNumber,
      pages: Math.ceil(total / limitNumber),
      tasks 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('user', 'username email');
    
    if (!task) {
      return res.status(404).json({ 
        success: false,
        message: 'Task not found' 
      });
    }
    
    // Check if user has access to this task
    if (req.user.role !== 'admin' && task.user._id.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied' 
      });
    }
    
    res.json({ 
      success: true, 
      task 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

const updateTask = async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ 
        success: false,
        message: 'Task not found' 
      });
    }
    
    // Check if user has access to update this task
    if (req.user.role !== 'admin' && task.user.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied' 
      });
    }
    
    const allowedUpdates = ['title', 'description', 'status', 'priority'];
    const updates = {};
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });
    
    task = await Task.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('user', 'username email');
    
    res.json({ 
      success: true, 
      task 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ 
        success: false,
        message: 'Task not found' 
      });
    }
    
    // Check if user has access to delete this task
    if (req.user.role !== 'admin' && task.user.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied' 
      });
    }
    
    await task.deleteOne();
    
    res.json({ 
      success: true, 
      message: 'Task deleted successfully' 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

const getTaskStats = async (req, res) => {
  try {
    const matchQuery = req.user.role !== 'admin' 
      ? { user: req.user._id }
      : {};
    
    const stats = await Task.aggregate([
      { $match: matchQuery },
      { 
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          highPriority: { $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] } },
          mediumPriority: { $sum: { $cond: [{ $eq: ['$priority', 'medium'] }, 1, 0] } },
          lowPriority: { $sum: { $cond: [{ $eq: ['$priority', 'low'] }, 1, 0] } }
        }
      }
    ]);
    
    res.json({
      success: true,
      stats: stats[0] || {
        total: 0,
        completed: 0,
        inProgress: 0,
        pending: 0,
        highPriority: 0,
        mediumPriority: 0,
        lowPriority: 0
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = { 
  createTask, 
  getTasks, 
  getTaskById, 
  updateTask, 
  deleteTask,
  getTaskStats 
};