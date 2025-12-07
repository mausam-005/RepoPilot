require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth.routes");
const healthRoutes = require("./routes/health.routes");
const reposRoutes = require("./routes/repos.routes");
const issuesRoutes = require("./routes/issues.routes");
const bookmarksRoutes = require("./routes/bookmarks.routes");
const myIssuesRoutes = require("./routes/myissues.routes");
const userRoutes = require("./routes/user.routes");
const auth = require("./middleware/auth");

const app = express();

connectDB();

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://repopilot-by-mausam.netlify.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    exposedHeaders: ["x-access-token", "x-refresh-token"],
    credentials: true,
  })
);

app.use(express.json());

app.use("/api/health", auth, healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/repos", reposRoutes);
app.use("/api/issues", auth, issuesRoutes);
app.use("/api/bookmarks", auth, bookmarksRoutes);
app.use("/api/myissues", auth, myIssuesRoutes);
app.use("/api/user", auth, userRoutes);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
