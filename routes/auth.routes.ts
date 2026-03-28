import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js";

const authRouter = Router();

authRouter.post("/register-student", AuthController.registerStudent);
authRouter.post("/register-instructor", AuthController.registerInstructor);

authRouter.post("/login-student", AuthController.loginStudent);
authRouter.post("/login-instructor", AuthController.loginInstructor);

export default authRouter;
