import express from "express";
import cors from "cors";
import authRouter from "./routes/auth.routes.ts";
import usersRouter from "./routes/users.routes.ts";
import { errorHandler } from "./middleware/errorHandler.ts";
import resumeRouter from "./routes/resume.routes.ts";
import resumeVerificationRoutes from "./routes/resume-verification.routes.js";
import candidateProfileRoutes from "./routes/candidate-profile.routes.js";
import discoveredJobsRoutes from "./routes/discovered-jobs.routes.js";
import resumeStudioRoutes from "./routes/resume-studio.routes.js";

const app = express();

// Allow requests from the local React frontend
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Parse incoming JSON request bodies
app.use(express.json());

// Authentication routes
app.use("/api/auth", authRouter);

app.use("/api/users", usersRouter);  

// app.use("/api/users", usersRouter);
app.use("/api/resumes", resumeRouter);
app.use("/api/resume-verification", resumeVerificationRoutes);
app.use("/api/candidate-profile", candidateProfileRoutes);
app.use("/api/resume-studio", resumeStudioRoutes);

// Health check
app.get("/health", (_req, res) => {
  res.json({ message: "NORTH API is running" });
});
app.use("/api/jobs", discoveredJobsRoutes);


export default app;
