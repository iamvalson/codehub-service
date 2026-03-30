import { prisma } from "../lib/prisma.js";

export const createAssignment = async (
  instructorId: string,
  courseCode: string,
  assignmentTitle: string,
  assignmentDesc: string,
  deadline: Date,
) => {
  const course = await prisma.courses.findUnique({
    where: { courseCode },
  });

  if (!course) throw new Error("Course not found");

  if (course.instructorId !== instructorId) throw new Error("Access Forbidden");

  const assignment = await prisma.assignments.create({
    data: {
      courseId: course.id,
      title: assignmentTitle,
      description: assignmentDesc,
      deadline,
    },
  });

  return assignment;
};

export const getAssignmentsByCourse = async (
  courseId: string,
  userId: string,
  role: "instructor" | "student",
) => {
  const course = await prisma.courses.findUnique({
    where: { id: courseId },
  });

  if (!course) throw new Error("COURSE_NOT_FOUND");

  if (role === "instructor" && course.instructorId !== userId) {
    throw new Error("UNAUTHORIZED");
  }

  if (role === "student") {
    const enrollment = await prisma.enrollment.findFirst({
      where: { studentId: userId, courseId },
    });
    if (!enrollment) throw new Error("NOT_ENROLLED");
  }

  const assignments = await prisma.assignments.findMany({
    where: { courseId },
    orderBy: { deadline: "asc" },
  });

  return assignments;
};

export const getAssignmentById = async (
  assignmentId: string,
  userId: string,
  role: "instructor" | "student",
) => {
  const assignment = await prisma.assignments.findUnique({
    where: { id: assignmentId },
    include: {
      course: {
        select: {
          id: true,
          courseCode: true,
          courseName: true,
          instructorId: true,
        },
      },
    },
  });

  if (!assignment) throw new Error("ASSIGNMENT_NOT_FOUND");

  if (role === "instructor" && assignment.course.instructorId !== userId) {
    throw new Error("UNAUTHORIZED");
  }

  if (role === "student") {
    const enrollment = await prisma.enrollment.findFirst({
      where: { studentId: userId, courseId: assignment.course.id },
    });
    if (!enrollment) throw new Error("NOT_ENROLLED");
  }

  return assignment;
};
