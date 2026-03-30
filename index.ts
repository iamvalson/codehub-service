import "dotenv/config";
import express from "express";
import morgan from "morgan";
import assignmentRouter from "./routes/assignment.routes.js";
import authRouter from "./routes/auth.routes.js";
import courseRouter from "./routes/course.routes.js";
import submissionRouter from "./routes/submission.routes.js";

const app = express();

app.use(morgan("dev"));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.use("/api/auth", authRouter);
app.use("/api/course", courseRouter);
app.use("/api/assignments", assignmentRouter);
app.use("/api/submissions", submissionRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
