import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware.js";
import {
  createAssignment,
  getAssignmentById,
  getAssignmentsByCourse,
} from "../services/assignment.service.js";

export const handleCreateAssignment = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const { courseCode, assignmentTitle, assignmentDesc, deadlineString } =
      req.body;

    if (!courseCode || !assignmentTitle || !assignmentDesc || !deadlineString)
      return res.status(400).json({ message: "Missing required fields" });

    const deadline = new Date(deadlineString);

    if (!deadline) {
      return res.status(400).json({ message: "Invalid deadline date" });
    } else if (deadline <= new Date()) {
      return res
        .status(400)
        .json({ message: "Deadline must be in the future" });
    }

    const assignment = await createAssignment(
      req.user!.id,
      courseCode,
      assignmentTitle,
      assignmentDesc,
      deadline,
    );

    return res.status(201).json(assignment);
  } catch (error) {
    if (error instanceof Error && error.message === "Course not found") {
      return res.status(404).json({ message: "Course not found" });
    } else if (error instanceof Error && error.message === "Access Forbidden") {
      return res.status(403).json({
        message: "You are not authorized to create assignments for this course",
      });
    } else {
      return res.status(500).json({ message: error });
    }
  }
};

export const handleGetAssignmentsByCourse = async (
  req: AuthRequest,
  res: Response,
) => {
  const courseId = req.params.courseId as string;

  try {
    const assignments = await getAssignmentsByCourse(
      courseId,
      req.user!.id,
      req.user!.role,
    );
    return res.status(200).json(assignments);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "COURSE_NOT_FOUND")
        return res.status(404).json({ error: "Course not found" });
      if (error.message === "UNAUTHORIZED")
        return res.status(403).json({ error: "This is not your course" });
      if (error.message === "NOT_ENROLLED")
        return res
          .status(403)
          .json({ error: "You are not enrolled in this course" });
    }
    return res.status(500).json({ error: "Server error" });
  }
};

export const handleGetAssignmentById = async (
  req: AuthRequest,
  res: Response,
) => {
  const assignmentId = req.params.assignmentId as string;

  try {
    const assignment = await getAssignmentById(
      assignmentId,
      req.user!.id,
      req.user!.role,
    );
    return res.status(200).json(assignment);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "ASSIGNMENT_NOT_FOUND")
        return res.status(404).json({ error: "Assignment not found" });
      if (error.message === "UNAUTHORIZED")
        return res.status(403).json({ error: "This is not your assignment" });
      if (error.message === "NOT_ENROLLED")
        return res
          .status(403)
          .json({ error: "You are not enrolled in this course" });
    }
    return res.status(500).json({ error: "Server error" });
  }
};
