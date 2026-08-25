import fs from "node:fs/promises";
import multer from "multer";
import os from "node:os";
import path from "node:path";

export async function getTempUploadDir(): Promise<string> {
  const tempDir = path.join(os.tmpdir(), "acme-pdf-uploads");

  try {
    await fs.mkdir(tempDir, { recursive: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "EEXIST") {
      throw error;
    }
  }

  return tempDir;
}

export async function createPdfUploadMiddleware() {
  const uploadDir = await getTempUploadDir();

  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(
        null,
        `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`,
      );
    },
  });

  return multer({
    storage,
    limits: {
      fileSize: 500 * 1024 * 1024,
    },
  });
}
