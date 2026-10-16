
import express from "express";
import cors from "cors";
import authRouter from "./routes/auth.routes.ts";
import usersRouter from "./routes/users.routes.ts";

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

// Health check
app.get("/health", (_req, res) => {
  res.json({ message: "NORTH API is running" });
});

export default app;
