import { prisma } from "../lib/prisma.js";

export const createCourse = async (
  courseCode: string,
  courseName: string,
  instructorId: string,
) => {
  const existing = await prisma.courses.findUnique({
    where: { courseCode },
  });

  if (existing) {
    throw new Error("Course already exists");
  }

  const course = await prisma.courses.create({
    data: {
      courseCode,
      courseName,
      instructorId,
    },
  });

  return course;
};

export const getAllAvailableCourses = async () => {
  const courses = await prisma.courses.findMany();

  return courses;
};

export const enrolStudentToCourse = async (
  studentId: string,
  courseCode: string,
) => {
  const course = await prisma.courses.findUnique({
    where: { courseCode },
  });

  if (!course) throw new Error("Course does not exist");

  const enrollment = await prisma.enrollment.create({
    data: {
      studentId,
      courseId: course.id,
    },
  });

  return enrollment;
};

export const getEnrolledCourses = async (studentId: string) => {
  const enrollments = await prisma.enrollment.findMany({
    where: { studentId },
    include: {
      courses: {
        include: {
          instructor: { select: { name: true, email: true } },
        },
      },
    },
  });

  return enrollments.map((enrollment) => enrollment.courses);
};
