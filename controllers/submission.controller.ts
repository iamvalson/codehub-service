import { Response } from "express";
import fs from "fs";
import { AuthRequest } from "../middlewares/auth.middleware.js";
import {
  downloadSubmission,
  getMySubmission,
  submitAssignment,
} from "../services/submission.service.js";

export const handleSubmitAssignment = async (
  req: AuthRequest,
  res: Response,
) => {
  if (!req.file) {
    return res.status(400).json({ error: "ZIP file is required" });
  }

  const { assignmentId } = req.body;

  if (!assignmentId) {
    fs.unlinkSync(req.file.path);
    return res.status(400).json({ error: "assignmentId is required" });
  }

  try {
    const submission = await submitAssignment(
      req.user!.id,
      assignmentId as string,
      req.file.path,
    );

    return res.status(201).json({
      message: "Submission received. Grading in progress...",
      submissionId: submission.id,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "ASSIGNMENT_NOT_FOUND")
        return res.status(404).json({ error: "Assignment not found" });
      if (error.message === "DEADLINE_PASSED")
        return res.status(403).json({ error: "Deadline has passed" });
      if (error.message === "NOT_ENROLLED")
        return res
          .status(403)
          .json({ error: "You are not enrolled in this course" });
    }
    return res.status(500).json({ error: "Server error" });
  }
};

export const handleGetMySubmission = async (
  req: AuthRequest,
  res: Response,
) => {
  const assignmentId = req.params.assignmentId as string;

  try {
    const submission = await getMySubmission(req.user!.id, assignmentId);
    return res.status(200).json(submission);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "SUBMISSION_NOT_FOUND")
        return res
          .status(404)
          .json({ error: "No submission found for this assignment" });
    }
    return res.status(500).json({ error: "Server error" });
  }
};

export const handleDownloadSubmission = async (
  req: AuthRequest,
  res: Response,
) => {
  const submissionId = req.params.submissionId as string;

  try {
    const submission = await downloadSubmission(submissionId, req.user!.id);

    const filename = `${submission.student.matricNumber}_${submission.assignment.title.replace(/\s+/g, "_")}.zip`;

    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Type", "application/zip");

    const stream = fs.createReadStream(submission.zipPath);

    stream.on("error", () => {
      return res.status(500).json({ error: "Error reading file" });
    });

    stream.pipe(res);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "SUBMISSION_NOT_FOUND")
        return res.status(404).json({ error: "Submission not found" });
      if (error.message === "UNAUTHORIZED")
        return res.status(403).json({ error: "Not authorized" });
      if (error.message === "FILE_NOT_FOUND")
        return res
          .status(404)
          .json({ error: "File no longer exists on server" });
    }
    return res.status(500).json({ error: "Server error" });
  }
};
