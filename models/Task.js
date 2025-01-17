const mongoose = require("mongoose");

const statusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ["TO_DO", "IN_PROGRESS", "DONE"],
    required: true,
  },
  comment: {
    type: String,
    trim: true,
  },
  changed_at: {
    type: Date,
    default: Date.now,
  },
});

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxLength: 100,
  },
  description: {
    type: String,
    trim: true,
    maxLength: 500,
  },
  status: {
    type: String,
    enum: ["TO_DO", "IN_PROGRESS", "DONE"],
    default: "TO_DO",
  },
  fileUrl: {
    type: String,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  status_history: [statusHistorySchema],
});

module.exports = mongoose.model("Task", taskSchema);
