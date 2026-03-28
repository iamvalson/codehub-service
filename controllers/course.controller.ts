import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import type { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware.js";
import {
  createCourse,
  enrolStudentToCourse,
  getAllAvailableCourses,
  getEnrolledCourses,
} from "../services/course.service.js";

export const handleCreateCourse = async (req: AuthRequest, res: Response) => {
  const { courseCode, courseName } = req.body;

  if (!courseCode || !courseName) {
    return res.status(400).json({ error: "Course code and name are required" });
  }

  try {
    const course = await createCourse(courseCode, courseName, req.user!.id);

    return res.status(201).json(course);
  } catch (error) {
    if (error instanceof Error && error.message === "Course already exists") {
      return res.status(409).json({ error: "Course code already exists" });
    }

    return res.status(500).json({ error: "Server error" });
  }
};

export const handleFetchCourses = async (req: AuthRequest, res: Response) => {
  try {
    const courses = await getAllAvailableCourses();

    if (!courses)
      return res.status(200).json({ message: "No course available" });

    return res.status(200).json(courses);
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

export const handleEnrollment = async (req: AuthRequest, res: Response) => {
  try {
    const { courseCode } = req.body;

    if (!courseCode) {
      return res.status(400).json({ error: "Course are required" });
    }

    const enrollment = await enrolStudentToCourse(req.user!.id, courseCode);

    return res.status(201).json(enrollment);
  } catch (error) {
    if (error instanceof Error && error.message === "Course does not exist") {
      return res.status(404).json({ error: "Course does not exist" });
    } else if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return res
        .status(409)
        .json({ message: "Already enrolled in this course" });
    } else {
      return res.status(500).json({ message: error });
    }
  }
};

export const handleFetchEnrolledCourses = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const courses = await getEnrolledCourses(req.user!.id);

    if (!courses)
      return res.status(200).json({ message: "No enrolled course found" });

    return res.status(200).json(courses);
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};
