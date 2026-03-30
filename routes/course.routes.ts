import { Router } from "express";
import { handleGetAssignmentsByCourse } from "../controllers/assignment.controller.js";
import {
  handleCreateCourse,
  handleEnrollment,
  handleFetchCourses,
  handleFetchEnrolledCourses,
} from "../controllers/course.controller.js";
import { authenticate, requireRole } from "../middlewares/auth.middleware.js";

const courseRouter = Router();

courseRouter.post(
  "/create-course",
  authenticate,
  requireRole("instructor"),
  handleCreateCourse,
);

courseRouter.post(
  "/enroll",
  authenticate,
  requireRole("student"),
  handleEnrollment,
);

courseRouter.get(
  "/available-courses",
  authenticate,
  requireRole("student"),
  handleFetchCourses,
);

courseRouter.get(
  "/enrolled-courses",
  authenticate,
  requireRole("student"),
  handleFetchEnrolledCourses,
);

courseRouter.get("/:courseId", authenticate, handleGetAssignmentsByCourse);

export default courseRouter;
