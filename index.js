// backend/index.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const Task = require('./models/Task');

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Use Render's PORT and .env MongoDB URI
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

// ✅ Simple health check route (helps Render test)
app.get('/', (req, res) => {
  res.send('✅ Todo API is running!');
});

// Connect to MongoDB
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// --- Routes ---

// Get all tasks
app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Add new task
app.post('/api/tasks', async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });
    const task = new Task({ title });
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add task' });
  }
});

// Toggle done/undone
app.put('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { done } = req.body; // take done value from frontend
    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    task.done = done !== undefined ? done : !task.done; // fallback to toggle
    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Delete task
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findByIdAndDelete(id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// Start server
app.listen(PORT, () => console.log(`🚀 Server listening on port ${PORT}`));
