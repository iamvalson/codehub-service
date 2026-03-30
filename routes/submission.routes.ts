import { Router } from "express";
import {
  handleDownloadSubmission,
  handleGetMySubmission,
  handleSubmitAssignment,
} from "../controllers/submission.controller.js";
import { authenticate, requireRole } from "../middlewares/auth.middleware.js";
import { uploadMiddleware } from "../middlewares/upload.middleware.js";

const submissionRouter = Router();

submissionRouter.post(
  "/",
  authenticate,
  requireRole("student"),
  uploadMiddleware,
  handleSubmitAssignment,
);

submissionRouter.get(
  "/my/:assignmentId",
  authenticate,
  requireRole("student"),
  handleGetMySubmission,
);

submissionRouter.get(
  "/:submissionId/download",
  authenticate,
  requireRole("instructor"),
  handleDownloadSubmission,
);

export default submissionRouter;
