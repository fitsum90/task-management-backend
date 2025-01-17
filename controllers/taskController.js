const Task = require("../models/Task.js");
const logger = require("../utils/logger.js");
const cloudinary = require("cloudinary").v2;
const { Readable } = require("stream");

const bufferToStream = (buffer) => {
  return Readable.from(buffer);
};

// Controller function to create a new task
const createTask = async (req, res) => {
  try {
    const { title, description } = req.body;
    let fileUrl = null;

    if (req.file) {
      // Convert buffer to stream
      const stream = bufferToStream(req.file.buffer);

      // Upload to Cloudinary using stream
      const uploadPromise = new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: "auto",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        stream.pipe(uploadStream);
      });

      const result = await uploadPromise;
      fileUrl = result.secure_url;
    }

    const task = new Task({
      title,
      description,
      fileUrl,
      status: "TO_DO",
      created_at: new Date(),
    });

    await task.save();
    res.status(201).json(task);
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ error: "Failed to create task" });
  }
};

// Controller function to get all tasks
const getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find().sort({ created_at: -1 });
    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
};

const updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, comment } = req.body;

    // Validate status transition
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    const validTransitions = {
      TO_DO: ["IN_PROGRESS"],
      IN_PROGRESS: ["DONE", "TO_DO"],
      DONE: ["IN_PROGRESS"],
    };

    if (!validTransitions[task.status].includes(status)) {
      return res.status(400).json({
        error: `Invalid status transition from ${task.status} to ${status}`,
      });
    }

    // Update task with status history
    const updatedTask = await Task.findByIdAndUpdate(
      id,
      {
        status,
        $push: {
          status_history: {
            status,
            comment,
            changed_at: new Date(),
          },
        },
      },
      { new: true, runValidators: true }
    );

    logger.info(`Task ${id} status updated to ${status}`);
    res.json(updatedTask);
  } catch (error) {
    logger.error("Error updating task status:", error);
    res.status(500).json({ error: "Failed to update task status" });
  }
};

const getTaskHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json(task.status_history);
  } catch (error) {
    logger.error("Error fetching task history:", error);
    res.status(500).json({ error: "Failed to fetch task history" });
  }
};

// Export functions separately
module.exports = {
  createTask,
  getAllTasks,
  updateTaskStatus,
  getTaskHistory,
};
