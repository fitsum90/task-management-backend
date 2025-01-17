const { logger } = require("../utils/logger.js");

const errorHandler = (err, req, res, next) => {
  logger.error("Error:", err);

  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "File size too large" });
    }
    return res.status(400).json({ error: "File upload error" });
  }

  if (err.name === "ValidationError") {
    return res.status(400).json({ error: err.message });
  }

  res.status(500).json({ error: "Internal server error" });
};

module.exports = errorHandler;
