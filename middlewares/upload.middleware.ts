import fs from "fs";
import multer from "multer";
import path from "path";

const uploadDir = "uploads/";

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req: any, file, cb) => {
    const studentId = req.user?.id || "unknown";
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `${studentId}_${timestamp}${ext}`);
  },
});

const fileFilter = (
  _req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  if (
    file.mimetype === "application/zip" ||
    file.originalname.endsWith(".zip")
  ) {
    cb(null, true);
  } else {
    cb(new Error("INVALID_FILE_TYPE"));
  }
};

export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 },
}).single("file");
