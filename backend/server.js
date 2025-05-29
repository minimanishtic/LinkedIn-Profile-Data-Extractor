require("dotenv").config();
const app = require("./app");

// Set port
const PORT = process.env.PORT || 3001;

// Start server only when not in Vercel environment
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(
      `Health check available at: http://localhost:${PORT}/api/health`,
    );
  });
}

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  // Close server & exit process
  process.exit(1);
});

// Export app for Vercel
module.exports = app;
