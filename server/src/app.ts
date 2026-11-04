import express from "express";
import cors from "cors";
import authRouter from "./routes/auth.routes.ts";
import usersRouter from "./routes/users.routes.ts";
import { errorHandler } from "./middleware/errorHandler.ts";
import resumeRouter from "./routes/resume.routes.ts";
import { testS3Connection } from "./lib/s3.js";

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


// Health check
app.get("/health", (_req, res) => {
  res.json({ message: "NORTH API is running" });
});
// 
const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);

  try {
    await testS3Connection();
  } catch (error) {
    console.error("AWS S3 connection failed:", error);
  }
});

export default app;
