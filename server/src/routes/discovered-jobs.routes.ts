
import { Router } from "express";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { getDiscoveredJobsController } from "../controllers/discovered-jobs.controller.js";

const router = Router();

router.get("/", authenticateToken, getDiscoveredJobsController);

export default router;