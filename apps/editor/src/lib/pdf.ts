import { PDFDocument, rgb } from "pdf-lib";
import type { OverlayItem } from "../types/editor";

function hexToRgb(hex: string) {
  const value = hex.replace("#", "");
  const isShort = value.length === 3;
  const parsed = isShort
    ? value
        .split("")
        .map((char) => char + char)
        .join("")
    : value;

  const bigint = Number.parseInt(parsed, 16);
  return {
    r: ((bigint >> 16) & 255) / 255,
    g: ((bigint >> 8) & 255) / 255,
    b: (bigint & 255) / 255,
  };
}

function dataUrlToBytes(dataUrl: string): Uint8Array {
  try {
    const base64 = dataUrl.split(",")[1] ?? "";
    if (!base64) {
      console.warn("Invalid data URL: no base64 content found");
      return new Uint8Array();
    }

    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);

    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }

    return bytes;
  } catch (error) {
    console.warn("Failed to convert data URL to bytes:", error);
    return new Uint8Array();
  }
}

export async function getPdfPageCount(bytes: Uint8Array): Promise<number> {
  const pdf = await PDFDocument.load(bytes);
  return pdf.getPageCount();
}

export async function applyPdfOverlays(
  bytes: Uint8Array,
  overlays: OverlayItem[],
  combinedPages?: Array<{ id: string; docId: string; sourcePage: number }>,
): Promise<Uint8Array> {
  if (overlays.length === 0) {
    return bytes;
  }

  const document = await PDFDocument.load(bytes);
  const pages = document.getPages();

  // Create a map from pageId to actual page index in the final document
  const pageIdToIndex = new Map<string, number>();
  if (combinedPages) {
    combinedPages.forEach((pageRef, index) => {
      pageIdToIndex.set(pageRef.id, index);
    });
  }

  for (const overlay of overlays) {
    // Determine the correct page index
    let pageIndex: number;
    if (overlay.pageId && pageIdToIndex.has(overlay.pageId)) {
      pageIndex = pageIdToIndex.get(overlay.pageId)!;
    } else {
      pageIndex = overlay.pageIndex;
    }

    const page = pages[pageIndex];

    if (!page) {
      continue;
    }

    const pageWidth = page.getWidth();
    const pageHeight = page.getHeight();

    const width = overlay.width * pageWidth;
    const height = overlay.height * pageHeight;
    const x = overlay.x * pageWidth;
    const y = pageHeight - overlay.y * pageHeight - height;

    if (overlay.type === "highlight") {
      const highlightColor = hexToRgb(overlay.highlightColor ?? "#facc15");
      page.drawRectangle({
        x,
        y,
        width,
        height,
        color: rgb(highlightColor.r, highlightColor.g, highlightColor.b),
        opacity: 0.45,
        borderWidth: 0,
      });
      continue;
    }

    if (
      (overlay.type === "image" || overlay.type === "signature") &&
      overlay.imageDataUrl
    ) {
      try {
        const imageBytes = dataUrlToBytes(overlay.imageDataUrl);

        if (!imageBytes || imageBytes.length < 4) {
          console.warn("Invalid image data for overlay:", overlay.type);
          continue;
        }

        const isPng =
          imageBytes[0] === 0x89 &&
          imageBytes[1] === 0x50 &&
          imageBytes[2] === 0x4e &&
          imageBytes[3] === 0x47;

        const isJpeg = imageBytes[0] === 0xff && imageBytes[1] === 0xd8;

        if (!isPng && !isJpeg) {
          console.warn(
            "Image data does not appear to be PNG or JPEG. First bytes:",
            Array.from(imageBytes.slice(0, 4))
              .map((b) => `0x${b.toString(16)}`)
              .join(" "),
          );
          continue;
        }

        let image;
        try {
          image = isPng
            ? await document.embedPng(imageBytes)
            : await document.embedJpg(imageBytes);
        } catch (embedError) {
          try {
            image = isPng
              ? await document.embedJpg(imageBytes)
              : await document.embedPng(imageBytes);
          } catch {
            console.warn("Failed to embed image as PNG or JPEG:", embedError);
            continue;
          }
        }

        const scale = Math.min(width / image.width, height / image.height);
        const drawWidth = image.width * scale;
        const drawHeight = image.height * scale;
        const drawX = x + (width - drawWidth) / 2;
        const drawY = y + (height - drawHeight) / 2;

        page.drawImage(image, {
          x: drawX,
          y: drawY,
          width: drawWidth,
          height: drawHeight,
        });
      } catch (error) {
        console.warn("Error processing image overlay:", error);
      }
      continue;
    }
  }

  return document.save({ useObjectStreams: true });
}
