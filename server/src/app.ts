
import express from "express";
import authRouter from "./routes/auth.routes.ts";

const app = express();

app.use(express.json());
app.use("/api/auth", authRouter);
app.get("/health", (_req, res) => {
  res.json({ message: "NORTH API is running" });
});

export default app;