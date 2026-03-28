import type { Request, Response } from "express";
import { AuthService } from "../services/auth.service.js";

export class AuthController {
  static registerStudent = async (req: Request, res: Response) => {
    try {
      const { matricNumber, email, name, password } = req.body;
      // Call the AuthService to handle registration logic
      const newUser = await AuthService.registerStudent({
        matricNumber,
        email,
        name,
        password,
      });
      res.status(201).json(newUser);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  // Instructor Registration logic
  static registerInstructor = async (req: Request, res: Response) => {
    try {
      const { email, name, password } = req.body;
      // Call the AuthService to handle registration logic
      const newUser = await AuthService.registerInstructor({
        email,
        name,
        password,
      });
      res.status(201).json(newUser);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  static loginStudent = async (req: Request, res: Response) => {
    try {
      const { identifier, password } = req.body;

      const user = await AuthService.loginStudent({
        identifier,
        password,
      });
      res.status(200).json(user);
    } catch (error: any) {
      if (error.message == "User not found") {
        res.status(404).json({
          success: false,
          message: "User not found",
        });
      } else if (error.message == "Invalid credentials") {
        res.status(401).json({
          success: false,
          message: "Invalid password",
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Something went wrong. Please try again.",
        });
      }
    }
  };

  // Instructor Login logic
  static loginInstructor = async (req: Request, res: Response) => {
    try {
      const { identifier, password } = req.body;

      const user = await AuthService.loginInstructor({
        identifier,
        password,
      });
      res.status(200).json(user);
    } catch (error: any) {
      if (error.message == "User not found") {
        res.status(404).json({
          success: false,
          message: "User not found",
        });
      } else if (error.message == "Invalid credentials") {
        res.status(401).json({
          success: false,
          message: "Invalid password",
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Something went wrong. Please try again.",
        });
      }
    }
  };
}
