import multer from "multer";
import fs from "fs";

const uploadDir = "./public/images";
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_")}`),
});

export const upload = multer({ storage, limits: { fileSize: 1 * 1024 * 1024 } });
