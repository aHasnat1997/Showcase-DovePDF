import { createContext } from "./context";
import { appRouter } from "./routers";
import { createPdfUploadMiddleware } from "./utils/upload";
import { env } from "@acme-pdf/env/server";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import cors from "cors";
import express from "express";
import HTMLtoDOCX from "html-to-docx";
import JSZip from "jszip";
import { spawn } from "node:child_process";
import fs from "node:fs";
import {
  mkdtemp,
  readdir,
  readFile,
  rm,
  unlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

type HtmlPage = {
  name: string;
  html: string;
};

const isZipBuffer = (data: Uint8Array): boolean =>
  data.length >= 2 && data[0] === 0x50 && data[1] === 0x4b;

const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const normalizeFontKey = (value: string): string =>
  value
    .replace(/^[A-Za-z0-9]+\+/, "") // strip GKKWXB+ prefix
    .replace(/\.[^./\\]+$/, "") // strip extension
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ""); // strip hyphens, spaces etc

const fontFormatFromName = (name: string): string => {
  const lower = name.toLowerCase();
  if (lower.endsWith(".woff2")) return "woff2";
  if (lower.endsWith(".woff")) return "woff";
  if (lower.endsWith(".otf")) return "opentype";
  return "truetype";
};

const isFontFileName = (name: string): boolean =>
  /\.(ttf|otf|woff2?|woff)$/i.test(name);

const getFontWeightFromName = (name: string): number => {
  const lower = name.toLowerCase();
  if (lower.includes("thin")) return 100;
  if (lower.includes("extralight") || lower.includes("ultralight")) return 200;
  if (lower.includes("light")) return 300;
  if (lower.includes("medium")) return 500;
  if (lower.includes("semibold") || lower.includes("demibold")) return 600;
  if (lower.includes("bold")) return 700;
  if (lower.includes("extrabold") || lower.includes("ultrabold")) return 800;
  if (lower.includes("black") || lower.includes("heavy")) return 900;
  return 400;
};

const getFontStyleFromName = (name: string): "normal" | "italic" =>
  name.toLowerCase().includes("italic") ? "italic" : "normal";

const findFontMatches = (familyKey: string, fonts: FontFile[]): FontFile[] => {
  const exact = fonts.filter((font) => font.key === familyKey);
  if (exact.length > 0) return exact;

  const partial = fonts.filter(
    (font) => font.key.includes(familyKey) || familyKey.includes(font.key),
  );
  return partial;
};

const getFontWeightFromKey = (key: string): number => {
  if (key.includes("thin")) return 100;
  if (key.includes("extralight") || key.includes("ultralight")) return 200;
  if (key.includes("light")) return 300;
  if (key.includes("medium") || key.includes("medi")) return 500;
  if (key.includes("semibold") || key.includes("demibold")) return 600;
  if (key.includes("bold") || key.includes("heavy") || key.includes("black"))
    return 700;
  if (key.includes("extrabold") || key.includes("ultrabold")) return 800;
  return 400;
};

const getFontStyleFromKey = (key: string): "normal" | "italic" =>
  key.includes("ital") || key.includes("oblique") ? "italic" : "normal";

// Infer weight/style directly from the CSS font-family value in the HTML
const inferStyleFromFamilyName = (
  raw: string,
): { weight: number; style: "normal" | "italic" } => {
  const key = raw.toLowerCase().replace(/[^a-z0-9]/g, "");
  return {
    weight: getFontWeightFromKey(key),
    style: getFontStyleFromKey(key),
  };
};

const buildFontFaceCss = (html: string, fonts: FontFile[]): string => {
  if (fonts.length === 0) return "";

  const fontFaces: string[] = [];
  const seen = new Set<string>();

  // Extract every font-family value used in the HTML
  const regex = /font-family:\s*([^;}{'"]+)/gi;

  for (const match of html.matchAll(regex)) {
    const raw = (match[1] ?? "").trim();

    // Handle comma-separated stacks
    for (const part of raw.split(",")) {
      const family = part.trim().replace(/^['"]|['"]$/g, "");
      if (!family) continue;

      const familyKey = normalizeFontKey(family);
      const inferred = inferStyleFromFamilyName(family);
      const matchedFonts = findFontMatches(familyKey, fonts);

      for (const font of matchedFonts) {
        // Use inferred weight/style from the HTML family name,
        // falling back to what was detected from the font filename
        const weight = inferred.weight !== 400 ? inferred.weight : font.weight;
        const style = inferred.style !== "normal" ? inferred.style : font.style;

        const signature = `${family}|${font.dataUrl}|${weight}|${style}`;
        if (seen.has(signature)) continue;
        seen.add(signature);

        fontFaces.push(
          `@font-face{` +
            `font-family:'${family}';` +
            `src:url('${font.dataUrl}') format('${font.format}');` +
            `font-weight:${weight};` +
            `font-style:${style};` +
            `font-display:swap;` +
            `}`,
        );
      }

      // Also register under the stripped name (without prefix)
      // so CSS like font-family:NimbusRomNo9L-Medi also resolves
      const strippedFamily = family.replace(/^[A-Za-z0-9]+\+/, "");
      if (strippedFamily !== family) {
        const strippedKey = normalizeFontKey(strippedFamily);
        const strippedFonts = findFontMatches(strippedKey, fonts);
        const strippedInferred = inferStyleFromFamilyName(strippedFamily);

        for (const font of strippedFonts) {
          const weight =
            strippedInferred.weight !== 400
              ? strippedInferred.weight
              : font.weight;
          const style =
            strippedInferred.style !== "normal"
              ? strippedInferred.style
              : font.style;
          const signature = `${strippedFamily}|${font.dataUrl}|${weight}|${style}`;
          if (seen.has(signature)) continue;
          seen.add(signature);

          fontFaces.push(
            `@font-face{` +
              `font-family:'${strippedFamily}';` +
              `src:url('${font.dataUrl}') format('${font.format}');` +
              `font-weight:${weight};` +
              `font-style:${style};` +
              `font-display:swap;` +
              `}`,
          );
        }
      }
    }
  }

  return fontFaces.join("");
};

const injectHeadStyle = (html: string, css: string): string => {
  if (!css) return html;
  const styleTag = `<style>${css}</style>`;

  if (html.includes("</head>")) {
    return html.replace("</head>", `${styleTag}</head>`);
  }

  if (html.includes("<head>")) {
    return html.replace("<head>", `<head>${styleTag}`);
  }

  return `${styleTag}${html}`;
};

const mimeFromName = (name: string): string => {
  const lower = name.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".gif")) return "image/gif";
  if (lower.endsWith(".svg")) return "image/svg+xml";
  return "application/octet-stream";
};

const getPageIndex = (name: string): number => {
  const match = name.match(/-(\d+)\.html$/i) ?? name.match(/_(\d+)\.html$/i);
  return match ? Number.parseInt(match[1] ?? "0", 10) : 0;
};

type FontFile = {
  key: string;
  dataUrl: string;
  format: string;
  weight: number;
  style: "normal" | "italic";
};

const buildFontFile = (
  baseName: string,
  dataUrl: string,
  format: string,
): FontFile => ({
  key: normalizeFontKey(baseName),
  dataUrl,
  format,
  weight: getFontWeightFromName(baseName),
  style: getFontStyleFromName(baseName),
});

const loadFontsFromDir = async (dirPath: string): Promise<FontFile[]> => {
  if (!dirPath || dirPath.trim().length === 0) {
    return [];
  }

  const results: FontFile[] = [];

  const walk = async (current: string) => {
    const entries = await readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      const nextPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        await walk(nextPath);
        continue;
      }

      if (!entry.isFile() || !isFontFileName(entry.name)) {
        continue;
      }

      const buffer = await readFile(nextPath);
      const base64 = buffer.toString("base64");
      const format = fontFormatFromName(entry.name);
      const dataUrl = `data:font/${format};base64,${base64}`;

      results.push(buildFontFile(entry.name, dataUrl, format));
    }
  };

  try {
    await walk(dirPath);
  } catch (error) {
    console.warn("Failed to load custom fonts:", error);
  }

  return results;
};

async function unzipHtmlPages(
  zipBytes: Uint8Array,
  extraFonts: FontFile[],
): Promise<HtmlPage[]> {
  const zip = await JSZip.loadAsync(zipBytes);
  const assets = new Map<string, string>();
  const fonts: FontFile[] = [];

  for (const name of Object.keys(zip.files)) {
    const file = zip.files[name];
    if (!file || file.dir) continue;
    if (isFontFileName(name)) {
      const base64 = await file.async("base64");
      const format = fontFormatFromName(name);
      const dataUrl = `data:font/${format};base64,${base64}`;
      const baseName = name.split("/").pop() ?? name;

      fonts.push(buildFontFile(baseName, dataUrl, format));
      continue;
    }

    if (!/\.(png|jpe?g|gif|svg)$/i.test(name)) continue;

    const base64 = await file.async("base64");
    const dataUrl = `data:${mimeFromName(name)};base64,${base64}`;
    assets.set(name, dataUrl);

    const baseName = name.split("/").pop();
    if (baseName) assets.set(baseName, dataUrl);
  }

  const rawHtmlFiles = Object.keys(zip.files)
    .filter((name) => name.toLowerCase().endsWith(".html"))
    .filter((name) => !name.toLowerCase().includes("_ind.html"));

  const numberedHtmlFiles = rawHtmlFiles.filter(
    (name) => /-(\d+)\.html$/i.test(name) || /_(\d+)\.html$/i.test(name),
  );

  const htmlFiles = (
    numberedHtmlFiles.length > 0 ? numberedHtmlFiles : rawHtmlFiles.slice(1)
  ).sort((a, b) => {
    const indexDiff = getPageIndex(a) - getPageIndex(b);
    return indexDiff !== 0 ? indexDiff : a.localeCompare(b);
  });

  const pages: HtmlPage[] = [];
  for (const name of htmlFiles) {
    const file = zip.files[name];
    if (!file || file.dir) continue;

    let html = await file.async("string");

    for (const [assetName, dataUrl] of assets) {
      const pattern = new RegExp(escapeRegExp(assetName), "g");
      html = html.replace(pattern, dataUrl);
    }

    const fontCss = buildFontFaceCss(html, [...fonts, ...extraFonts]);
    html = injectHeadStyle(html, fontCss);

    pages.push({ name, html });
  }

  return pages;
}

async function convertPdfToHtml(
  filePath: string,
  originalName: string,
): Promise<HtmlPage[]> {
  try {
    const dataBuffer = await readFile(filePath);
    const fileName =
      originalName.trim().length > 0 ? originalName : path.basename(filePath);

    const formData = new FormData();
    const pdfBlob = new Blob([dataBuffer], { type: "application/pdf" });
    formData.append("fileInput", pdfBlob, fileName);

    const baseUrl = env.STIRLING_PDF_URL.replace(/\/+$/, "");
    const headers: Record<string, string> = {};

    if (env.STIRLING_PDF_API_KEY.trim().length > 0) {
      headers["X-API-KEY"] = env.STIRLING_PDF_API_KEY;
    }

    const response = await fetch(`${baseUrl}/api/v1/convert/pdf/html`, {
      method: "POST",
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      const detail = errorText.trim().length > 0 ? ` - ${errorText}` : "";
      throw new Error(
        `StirlingPDF request failed with ${response.status}${detail}`,
      );
    }

    const bytes = new Uint8Array(await response.arrayBuffer());

    if (isZipBuffer(bytes)) {
      const extraFonts = await loadFontsFromDir(env.STIRLING_PDF_FONTS_DIR);
      return await unzipHtmlPages(bytes, extraFonts);
    }

    const html = new TextDecoder().decode(bytes);
    return html.trim().length > 0 ? [{ name: fileName, html }] : [];
  } catch (error) {
    console.error("StirlingPDF conversion error:", error);
    throw error;
  }
}

const asUint8Array = async (
  value: Blob | ArrayBuffer | Uint8Array,
): Promise<Uint8Array> => {
  if (value instanceof Uint8Array) {
    return value;
  }

  if (value instanceof Blob) {
    return new Uint8Array(await value.arrayBuffer());
  }

  return new Uint8Array(value);
};

async function convertHtmlToDocx(htmlContent: string): Promise<Uint8Array> {
  const content = htmlContent.trim().length > 0 ? htmlContent : "<p></p>";

  const result = await HTMLtoDOCX(content, null, {
    table: { row: { cantSplit: true } },
    footer: false,
    pageNumber: false,
  });

  return asUint8Array(result as Blob | ArrayBuffer | Uint8Array);
}

const findChromeExecutable = (): string | null => {
  const candidates = [
    process.env.CHROME_PATH,
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
  ].filter((value): value is string => !!value && value.trim().length > 0);

  return candidates.find((candidate) => fs.existsSync(candidate)) ?? null;
};

async function convertHtmlToPdfViaChrome(htmlContent: string): Promise<Buffer> {
  const chromePath = findChromeExecutable();
  if (!chromePath) {
    throw new Error("Chrome executable not found.");
  }

  const tempDir = await mkdtemp(path.join(tmpdir(), "acme-pdf-export-"));
  const inputPath = path.join(tempDir, "document.html");
  const outputPath = path.join(tempDir, "document.pdf");

  try {
    await writeFile(inputPath, htmlContent, "utf8");

    const args = [
      "--headless=new",
      "--disable-gpu",
      "--no-sandbox",
      "--disable-dev-shm-usage",
      "--disable-software-rasterizer",
      "--disable-extensions",
      "--allow-file-access-from-files",
      "--disable-web-security",
      "--run-all-compositor-stages-before-draw",
      "--virtual-time-budget=15000",
      "--print-to-pdf-no-header",
      "--force-color-profile=srgb",
      "--disable-blink-features=AutomationControlled",
      "--force-prefers-reduced-motion",
      `--print-to-pdf=${outputPath}`,
      pathToFileURL(inputPath).href,
    ];

    await new Promise<void>((resolve, reject) => {
      const child = spawn(chromePath, args, {
        stdio: ["ignore", "ignore", "pipe"],
      });
      let stderr = "";

      child.stderr.on("data", (chunk) => {
        stderr += chunk.toString();
      });

      child.on("error", reject);
      child.on("close", (code) => {
        if (code === 0) {
          resolve();
          return;
        }

        reject(
          new Error(
            `Chrome PDF render failed with code ${code ?? "unknown"}${stderr ? `: ${stderr}` : ""}`,
          ),
        );
      });
    });

    return Buffer.from(await readFile(outputPath));
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

async function startServer() {
  const app = express();

  app.use(
    cors({
      origin: [
        "https://editor.acmepdf.com",
        "https://acmepdf.com",
        "http://localhost:5173",
        "http://localhost:5174",
      ],
      methods: ["GET", "POST", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    }),
  );

  app.use(
    "/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    }),
  );

  app.use(express.json({ limit: "75mb" }));

  const pdfUpload = await createPdfUploadMiddleware();

  app.post("/api/pdf/export", pdfUpload.single("pdf"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      // Validate file type
      const isPdfFile =
        req.file.mimetype === "application/pdf" ||
        req.file.originalname.toLowerCase().endsWith(".pdf");

      if (!isPdfFile) {
        await unlink(req.file.path);
        return res.status(400).json({ error: "Only PDF files are allowed" });
      }

      const uploadedFilePath = req.file.path;
      const fileName = path.parse(req.file.originalname).name;

      try {
        console.log(`Converting PDF: ${uploadedFilePath}`);
        const pages = await convertPdfToHtml(
          uploadedFilePath,
          req.file.originalname,
        );

        if (!pages.length) {
          throw new Error("PDF conversion produced empty HTML");
        }

        console.log(`Successfully converted PDF: ${fileName}`);

        return res.json({
          success: true,
          pages,
          fileName,
        });
      } catch (convertError) {
        console.error("PDF conversion error:", convertError);
        return res.status(500).json({
          error: `Failed to convert PDF: ${convertError instanceof Error ? convertError.message : "Unknown error"}`,
        });
      } finally {
        try {
          await unlink(uploadedFilePath);
          console.log(`Deleted temporary PDF: ${uploadedFilePath}`);
        } catch (unlinkError) {
          console.error(`Failed to delete PDF: ${unlinkError}`);
        }
      }
    } catch (error) {
      console.error("Upload handler error:", error);
      return res.status(500).json({
        error: "Server error during file upload",
      });
    }
  });

  app.post("/api/pdf/compress", pdfUpload.single("pdf"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const isPdfFile =
        req.file.mimetype === "application/pdf" ||
        req.file.originalname.toLowerCase().endsWith(".pdf");

      if (!isPdfFile) {
        await unlink(req.file.path);
        return res.status(400).json({ error: "Only PDF files are allowed" });
      }

      const uploadedFilePath = req.file.path;
      let pdfBuffer = Buffer.from(await readFile(uploadedFilePath));

      const rawLevel = req.body?.compressionLevel;
      const compressionLevel =
        typeof rawLevel === "number"
          ? rawLevel
          : typeof rawLevel === "string"
            ? Number.parseInt(rawLevel, 10)
            : 0;

      if (compressionLevel > 0 && compressionLevel <= 9) {
        const compressedBuffer = await compressPdfViaStirling(
          pdfBuffer,
          compressionLevel,
        );
        pdfBuffer = Buffer.from(compressedBuffer);
      }

      res.setHeader("Content-Type", "application/pdf");
      return res.send(pdfBuffer);
    } catch (error) {
      console.error("PDF compression error:", error);
      return res.status(500).json({
        error: `Failed to compress PDF: ${error instanceof Error ? error.message : "Unknown error"}`,
      });
    } finally {
      if (req.file?.path) {
        try {
          await unlink(req.file.path);
        } catch (unlinkError) {
          console.error(`Failed to delete PDF: ${unlinkError}`);
        }
      }
    }
  });

  app.post("/api/docx/export", async (req, res) => {
    try {
      const { htmlContent, fileName } =
        (req.body as {
          htmlContent?: unknown;
          fileName?: unknown;
        }) ?? {};

      if (typeof htmlContent !== "string") {
        return res.status(400).json({ error: "htmlContent is required" });
      }

      const bytes = await convertHtmlToDocx(htmlContent);
      const rawName =
        typeof fileName === "string" && fileName.trim().length > 0
          ? fileName.trim()
          : "document.docx";
      const safeName = rawName.toLowerCase().endsWith(".docx")
        ? rawName
        : `${rawName}.docx`;

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${safeName.replaceAll('"', "")}"`,
      );

      return res.send(Buffer.from(bytes));
    } catch (error) {
      console.error("DOCX export error:", error);
      return res.status(500).json({
        error: `Failed to export DOCX: ${error instanceof Error ? error.message : "Unknown error"}`,
      });
    }
  });

  // Helper: Convert HTML to PDF using Stirling PDF
  async function convertHtmlToPdfViaStirling(
    htmlContent: string,
  ): Promise<Buffer> {
    const baseUrl = env.STIRLING_PDF_URL.replace(/\/+$/, "");
    const formData = new FormData();

    const htmlBlob = new Blob([htmlContent], { type: "text/html" });
    formData.append("fileInput", htmlBlob, "document.html");

    const headers: Record<string, string> = {};
    if (env.STIRLING_PDF_API_KEY.trim().length > 0) {
      headers["X-API-KEY"] = env.STIRLING_PDF_API_KEY;
    }

    const response = await fetch(`${baseUrl}/api/v1/convert/html/pdf`, {
      method: "POST",
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(
        `HTML to PDF conversion failed: ${response.status} - ${errorText}`,
      );
    }

    return Buffer.from(await response.arrayBuffer());
  }

  // Helper: Compress PDF using Stirling PDF
  async function compressPdfViaStirling(
    pdfBuffer: Buffer,
    compressionLevel: number,
  ): Promise<Buffer> {
    const baseUrl = env.STIRLING_PDF_URL.replace(/\/+$/, "");
    const formData = new FormData();

    // Convert Buffer to Uint8Array to avoid type issues
    const uint8Array = new Uint8Array(pdfBuffer);
    const pdfBlob = new Blob([uint8Array], { type: "application/pdf" });
    formData.append("fileInput", pdfBlob, "document.pdf");
    formData.append("optimizeLevel", compressionLevel.toString());
    formData.append("fastWebView", "true");

    const headers: Record<string, string> = {};
    if (env.STIRLING_PDF_API_KEY.trim().length > 0) {
      headers["X-API-KEY"] = env.STIRLING_PDF_API_KEY;
    }

    const response = await fetch(`${baseUrl}/api/v1/misc/compress-pdf`, {
      method: "POST",
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(
        `PDF compression failed: ${response.status} - ${errorText}`,
      );
    }

    return Buffer.from(await response.arrayBuffer());
  }

  // Endpoint: Export modified HTML to PDF (with optional compression)
  app.post("/api/html/export-pdf", async (req, res) => {
    try {
      const { htmlContent, fileName, compressionLevel } = req.body as {
        htmlContent?: unknown;
        fileName?: unknown;
        compressionLevel?: unknown;
      };

      if (typeof htmlContent !== "string" || !htmlContent.trim()) {
        return res.status(400).json({ error: "htmlContent is required" });
      }

      console.log("Converting HTML to PDF...");
      let pdfBuffer: Buffer;

      try {
        pdfBuffer = await convertHtmlToPdfViaChrome(htmlContent);
      } catch (chromeError) {
        console.warn(
          "Chrome HTML to PDF failed, falling back to Stirling:",
          chromeError,
        );
        pdfBuffer = await convertHtmlToPdfViaStirling(htmlContent);
      }

      // Compress if requested
      const compression =
        typeof compressionLevel === "number"
          ? compressionLevel
          : typeof compressionLevel === "string"
            ? Number.parseInt(compressionLevel)
            : 0;

      if (compression > 0 && compression <= 3) {
        console.log(`Compressing PDF with level ${compression}...`);
        pdfBuffer = await compressPdfViaStirling(pdfBuffer, compression);
      }

      const safeName =
        typeof fileName === "string" && fileName.trim()
          ? fileName.trim()
          : "document";
      const finalName = safeName.toLowerCase().endsWith(".pdf")
        ? safeName
        : `${safeName}.pdf`;

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${finalName.replace(/"/g, "")}"`,
      );

      console.log(`PDF export successful: ${finalName}`);
      return res.send(pdfBuffer);
    } catch (error) {
      console.error("HTML to PDF export error:", error);
      return res.status(500).json({
        error: `Failed to export PDF: ${error instanceof Error ? error.message : "Unknown error"}`,
      });
    }
  });

  // Serve landing page assets (but NOT index.html)
  // app.use(
  //   "/",
  //   express.static(path.resolve("../../apps/old-landing-page/dist"), {
  //     index: false,
  //   }),
  // );

  // Now your GET handler will run and do the replacement
  app.get("/", (_req, res) => {
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Dove PDF API</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #0f0f0f;
      color: #e5e5e5;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .card {
      text-align: center;
      padding: 3rem 4rem;
      border: 1px solid #2a2a2a;
      border-radius: 16px;
      background: #161616;
      max-width: 480px;
      width: 90%;
    }
    .icon { font-size: 3rem; margin-bottom: 1rem; }
    h1 { font-size: 1.75rem; font-weight: 600; margin-bottom: 0.5rem; }
    p { color: #888; font-size: 0.95rem; margin-bottom: 2rem; }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      background: #1a2a1a;
      color: #4ade80;
      border: 1px solid #2a4a2a;
      border-radius: 999px;
      padding: 0.35rem 1rem;
      font-size: 0.8rem;
      font-weight: 500;
    }
    .dot {
      width: 7px; height: 7px;
      background: #4ade80;
      border-radius: 50%;
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.3; }
    }
    .endpoints {
      margin-top: 2rem;
      text-align: left;
      border-top: 1px solid #2a2a2a;
      padding-top: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .endpoint {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 0.82rem;
    }
    .method {
      background: #1e2a3a;
      color: #60a5fa;
      border-radius: 4px;
      padding: 0.15rem 0.5rem;
      font-weight: 600;
      font-size: 0.75rem;
      min-width: 42px;
      text-align: center;
    }
    .method.post { background: #2a1e3a; color: #c084fc; }
    code { color: #aaa; font-family: monospace; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Acme PDF API</h1>
    <p>PDF processing & conversion service</p>
    <div class="badge"><div class="dot"></div> Operational</div>
    <div class="endpoints">
      <div class="endpoint"><span class="method post">POST</span><code>/api/pdf/convert</code></div>
      <div class="endpoint"><span class="method post">POST</span><code>/api/pdf/compress</code></div>
      <div class="endpoint"><span class="method post">POST</span><code>/api/docx/export</code></div>
      <div class="endpoint"><span class="method post">POST</span><code>/api/html/export-pdf</code></div>
      <div class="endpoint"><span class="method">GET</span><code>/health</code></div>
    </div>
  </div>
</body>
</html>`);
  });

  // Serve web app at "/editor"
  // app.use("/editor", express.static(path.resolve("../../apps/web/dist")));
  // app.get("/editor/{*path}", (_req, res) => {
  //   res.sendFile(path.resolve("../../apps/web/dist/index.html"));
  // });

  app.get("/health", (_req, res) => {
    const uptime = process.uptime();
    const h = Math.floor(uptime / 3600);
    const m = Math.floor((uptime % 3600) / 60);
    const s = Math.floor(uptime % 60);
    const uptimeStr = `${h}h ${m}m ${s}s`;

    res.status(200).send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Health — Dove PDF</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #0f0f0f;
      color: #e5e5e5;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .card {
      text-align: center;
      padding: 3rem 4rem;
      border: 1px solid #2a2a2a;
      border-radius: 16px;
      background: #161616;
      max-width: 400px;
      width: 90%;
    }
    .icon { font-size: 2.5rem; margin-bottom: 1rem; }
    h1 { font-size: 1.4rem; font-weight: 600; margin-bottom: 0.4rem; }
    .subtitle { color: #555; font-size: 0.85rem; margin-bottom: 2rem; }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      background: #1a2a1a;
      color: #4ade80;
      border: 1px solid #2a4a2a;
      border-radius: 999px;
      padding: 0.35rem 1rem;
      font-size: 0.8rem;
      font-weight: 500;
      margin-bottom: 2rem;
    }
    .dot {
      width: 7px; height: 7px;
      background: #4ade80;
      border-radius: 50%;
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.3; }
    }
    .stats {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
      border-top: 1px solid #2a2a2a;
      padding-top: 1.5rem;
    }
    .stat {
      background: #1a1a1a;
      border: 1px solid #2a2a2a;
      border-radius: 10px;
      padding: 0.85rem;
    }
    .stat-label { font-size: 0.7rem; color: #555; margin-bottom: 0.3rem; text-transform: uppercase; letter-spacing: 0.05em; }
    .stat-value { font-size: 0.95rem; font-weight: 600; color: #e5e5e5; font-family: monospace; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Acme PDF API</h1>
    <p class="subtitle">System Health</p>
    <div class="badge"><div class="dot"></div> All systems operational</div>
    <div class="stats">
      <div class="stat">
        <div class="stat-label">Status</div>
        <div class="stat-value" style="color:#4ade80">OK</div>
      </div>
      <div class="stat">
        <div class="stat-label">Uptime</div>
        <div class="stat-value">${uptimeStr}</div>
      </div>
      <div class="stat">
        <div class="stat-label">Memory</div>
        <div class="stat-value">${Math.round(process.memoryUsage().rss / 1024 / 1024)} MB</div>
      </div>
      <div class="stat">
        <div class="stat-label">Node</div>
        <div class="stat-value">${process.version}</div>
      </div>
    </div>
  </div>
</body>
</html>`);
  });

  // const PORT = parseInt(process.env.PORT as string, 10);
  const PORT = env.PORT;

  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

startServer().catch(console.error);
