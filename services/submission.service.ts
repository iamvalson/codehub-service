import fs from "fs";
import { prisma } from "../lib/prisma.js";

export const submitAssignment = async (
  studentId: string,
  assignmentId: string,
  zipPath: string,
) => {
  const assignment = await prisma.assignments.findUnique({
    where: { id: assignmentId },
    include: { course: true },
  });

  if (!assignment) {
    fs.unlinkSync(zipPath);
    throw new Error("ASSIGNMENT_NOT_FOUND");
  }

  if (new Date() > assignment.deadline) {
    fs.unlinkSync(zipPath);
    throw new Error("DEADLINE_PASSED");
  }

  const enrollment = await prisma.enrollment.findFirst({
    where: {
      studentId,
      courseId: assignment.courseId,
    },
  });

  if (!enrollment) {
    fs.unlinkSync(zipPath);
    throw new Error("NOT_ENROLLED");
  }

  const submission = await prisma.submission.upsert({
    where: {
      studentId_assignmentId: {
        studentId,
        assignmentId,
      },
    },
    update: {
      zipPath,
      submittedAt: new Date(),
      aiScore: null,
      aiFeedback: null,
      finalScore: null,
    },
    create: {
      studentId,
      assignmentId,
      zipPath,
    },
  });

  return submission;
};

export const getMySubmission = async (
  studentId: string,
  assignmentId: string,
) => {
  const submission = await prisma.submission.findUnique({
    where: {
      studentId_assignmentId: {
        studentId,
        assignmentId,
      },
    },
    select: {
      id: true,
      submittedAt: true,
      aiScore: true,
      aiFeedback: true,
      finalScore: true,
    },
  });

  if (!submission) throw new Error("SUBMISSION_NOT_FOUND");

  return submission;
};

export const downloadSubmission = async (
  submissionId: string,
  instructorId: string,
) => {
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: {
      assignment: {
        include: {
          course: true,
        },
      },
      student: {
        select: {
          matricNumber: true,
          name: true,
        },
      },
    },
  });

  if (!submission) throw new Error("SUBMISSION_NOT_FOUND");

  if (submission.assignment.course.instructorId !== instructorId) {
    throw new Error("UNAUTHORIZED");
  }

  if (!fs.existsSync(submission.zipPath)) {
    throw new Error("FILE_NOT_FOUND");
  }

  return submission;
};
