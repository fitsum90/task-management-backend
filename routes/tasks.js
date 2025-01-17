const express = require("express");
const multer = require("multer");
const validateTask = require("../middleware/validations.js");
const {
  getAllTasks,
  createTask,
  updateTaskStatus,
  getTaskHistory,
} = require("../controllers/taskController.js");
const router = express.Router();

// Multer configuration
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
}).single("file");

router.get("/", getAllTasks);

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Get all tasks
 *     responses:
 *       200:
 *         description: List of tasks
 */
router.post(
  "/",
  (req, res, next) => {
    upload(req, res, (err) => {
      if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ error: "File size exceeds 2MB" });
      } else if (err) {
        return res.status(400).json({ error: err.message });
      }
      next();
    });
  },
  validateTask,
  createTask
);
/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Create a new task
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               file:
 *                 type: string
 *                 format: binary
 */
router.patch("/:id/status", updateTaskStatus);
/**
 * @swagger
 * /api/tasks/{id}/status:
 *   patch:
 *     summary: Update the status of a task
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the task to update the status
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 description: The new status of the task
 *                 example: "completed"
 *     responses:
 *       200:
 *         description: Task status updated successfully
 *       400:
 *         description: Invalid task ID or status
 *       404:
 *         description: Task not found
 */

router.get("/:id/history", getTaskHistory);

/**
 * @swagger
 * /api/tasks/{id}/history:
 *   get:
 *     summary: Get the history of a specific task
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the task to fetch the history for
 *     responses:
 *       200:
 *         description: Task history fetched successfully
 *       404:
 *         description: Task not found
 */

module.exports = router;
