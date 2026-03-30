import { Router } from "express";
import {
  handleCreateAssignment,
  handleGetAssignmentById,
} from "../controllers/assignment.controller.js";
import { authenticate, requireRole } from "../middlewares/auth.middleware.js";

const assignmentRouter = Router();

assignmentRouter.post(
  "/create",
  authenticate,
  requireRole("instructor"),
  handleCreateAssignment,
);

assignmentRouter.get("/:assignmentId", authenticate, handleGetAssignmentById);

export default assignmentRouter;
