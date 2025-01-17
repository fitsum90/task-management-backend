const { z } = require("zod");

const taskSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().max(500).optional(),
});

const validateTask = (req, res, next) => {
  try {
    taskSchema.parse(req.body);
    next();
  } catch (error) {
    res.status(400).json({
      error: "Validation failed",
      details: error.errors,
    });
  }
};

module.exports = validateTask;
