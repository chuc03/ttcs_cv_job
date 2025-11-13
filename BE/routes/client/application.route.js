import express from "express";
import { authMiddleware } from "../../middlewares/admin/auth.middleware.js";
import {
  applyJob,
  getMyApplications,
} from "../../controllers/client/application.controller.js";

const router = express.Router();
router.post("/", authMiddleware, applyJob);
router.get("/my-applications", authMiddleware, getMyApplications);
export default router;
