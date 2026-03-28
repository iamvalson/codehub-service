import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";
import { Instructor, Student } from "../types/userType.js";

type LoginParams = {
  identifier: string;
  password: string;
};

export class AuthService {
  static registerStudent = async ({
    matricNumber,
    email,
    name,
    password,
  }: Student) => {
    const existingUser = await prisma.students.findUnique({
      where: {
        matricNumber,
      },
    });
    if (existingUser) {
      throw new Error("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.students.create({
      data: {
        matricNumber,
        email,
        name,
        password: hashedPassword,
      },
    });

    return newUser;
  };

  static registerInstructor = async ({ email, name, password }: Instructor) => {
    const existingUser = await prisma.instructors.findUnique({
      where: {
        email,
      },
    });
    if (existingUser) {
      throw new Error("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.instructors.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
    });

    return newUser;
  };

  static loginStudent = async ({ identifier, password }: LoginParams) => {
    const user = identifier.includes("@")
      ? await prisma.students.findUnique({
          where: { email: identifier },
        })
      : await prisma.students.findUnique({
          where: { matricNumber: identifier },
        });

    if (!user) {
      throw new Error("User not found");
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      throw new Error("Invalid credentials");
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        matricNumber: user.matricNumber,
        role: "student",
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "10m" },
    );

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        matricNumber: user.matricNumber,
      },
    };
  };

  static loginInstructor = async ({ identifier, password }: LoginParams) => {
    const user = await prisma.instructors.findUnique({
      where: { email: identifier },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      throw new Error("Invalid credentials");
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: "instructor" },
      process.env.JWT_SECRET as string,
      { expiresIn: "10m" },
    );

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: "instructor",
      },
    };
  };
}
