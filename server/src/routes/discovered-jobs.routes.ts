
import { Router } from "express";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { getDiscoveredJobsController,
  getDiscoveredJobByIdController, } from "../controllers/discovered-jobs.controller.js";

const router = Router();

router.get("/", authenticateToken, getDiscoveredJobsController);
router.get("/:id", authenticateToken, getDiscoveredJobByIdController);
export default router;