import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import type { OverlayItem } from "../types/editor";

const CAPTURE_SCALE = 2;
const EXPORT_PAGE_WIDTH = 820;

const waitForFrameLoad = (iframe: HTMLIFrameElement, doc: Document) =>
  new Promise<void>((resolve) => {
    if (doc.readyState === "complete") {
      resolve();
      return;
    }

    iframe.onload = () => resolve();
  });

const waitForFonts = async (doc: Document) => {
  try {
    await doc.fonts?.ready;
  } catch (error) {
    console.warn("Font layout wait engine bypassed:", error);
  }
};

const waitForImages = async (images: HTMLImageElement[]) => {
  await Promise.all(
    images.map(async (image) => {
      if (image.complete && image.naturalWidth > 0) {
        return;
      }

      if (typeof image.decode === "function") {
        await image.decode().catch(() => undefined);
        return;
      }

      await new Promise<void>((resolve) => {
        image.onload = () => resolve();
        image.onerror = () => resolve();
      });
    }),
  );
};

const nextFrame = () =>
  new Promise((resolve) => window.requestAnimationFrame(resolve));

type PreviewScaleResult = {
  contentWidth: number;
  contentHeight: number;
  captureHeight: number;
};

const applyPreviewScale = (
  doc: Document,
  width: number,
): PreviewScaleResult => {
  const root = doc.documentElement;
  const body = doc.body;

  root.style.margin = "0";
  root.style.padding = "0";
  root.style.overflow = "hidden";
  root.style.transform = "";
  root.style.transformOrigin = "top left";
  body.style.margin = "0";
  body.style.padding = "0";
  body.style.overflow = "hidden";
  body.contentEditable = "false";
  body.style.cursor = "default";
  body.style.userSelect = "none";
  root.style.pointerEvents = "none";
  body.style.pointerEvents = "none";
  root.style.width = "";
  root.style.height = "";
  body.style.width = "";
  body.style.height = "";

  const contentWidth = Math.max(root.scrollWidth, body.scrollWidth, width);
  const contentHeight = Math.max(root.scrollHeight, body.scrollHeight, 1);
  const scale = width / contentWidth;
  const captureHeight = Math.max(1, Math.ceil(contentHeight * scale));

  root.style.width = `${contentWidth}px`;
  root.style.height = `${contentHeight}px`;
  body.style.width = `${contentWidth}px`;
  body.style.height = `${contentHeight}px`;
  root.style.transform = `scale(${scale})`;

  return { contentWidth, contentHeight, captureHeight };
};

const getNumberFromPixelStyle = (value: string) => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
};

const getRenderedPreviewSize = (
  iframe: HTMLIFrameElement,
  doc: Document,
): PreviewScaleResult & { captureWidth: number } => {
  const root = doc.documentElement;
  const body = doc.body;
  const iframeRect = iframe.getBoundingClientRect();
  const rootRect = root.getBoundingClientRect();
  const contentWidth =
    getNumberFromPixelStyle(root.style.width) ||
    getNumberFromPixelStyle(body.style.width) ||
    root.scrollWidth ||
    body.scrollWidth ||
    EXPORT_PAGE_WIDTH;
  const contentHeight =
    getNumberFromPixelStyle(root.style.height) ||
    getNumberFromPixelStyle(body.style.height) ||
    root.scrollHeight ||
    body.scrollHeight ||
    Math.round(EXPORT_PAGE_WIDTH * Math.sqrt(2));
  const captureWidth = Math.max(
    1,
    Math.round(iframeRect.width || rootRect.width || EXPORT_PAGE_WIDTH),
  );
  const captureHeight = Math.max(
    1,
    Math.round(iframeRect.height || rootRect.height || contentHeight),
  );

  return { contentWidth, contentHeight, captureWidth, captureHeight };
};

const createOverlayElement = (
  doc: Document,
  overlay: OverlayItem,
  contentWidth: number,
  contentHeight: number,
): HTMLElement | HTMLImageElement | null => {
  const left = overlay.x * contentWidth;
  const top = overlay.y * contentHeight;
  const width = overlay.width * contentWidth;
  const height = overlay.height * contentHeight;
  const element = doc.createElement("div");

  if (overlay.type === "signature" || overlay.type === "image") {
    if (!overlay.imageDataUrl) {
      return null;
    }

    const image = doc.createElement("img");
    image.src = overlay.imageDataUrl;
    image.alt = overlay.type;
    image.draggable = false;
    image.style.display = "block";
    image.style.maxWidth = "100%";
    image.style.maxHeight = "100%";
    image.style.width = "auto";
    image.style.height = "auto";
    image.style.margin = "auto";
    element.style.display = "flex";
    element.style.alignItems = "center";
    element.style.justifyContent = "center";
    element.appendChild(image);
  }

  if (overlay.type === "highlight") {
    element.style.backgroundColor = overlay.highlightColor || "#22c55e76";
    element.style.borderRadius = "4px";
  }

  element.style.position = "absolute";
  element.style.left = `${left}px`;
  element.style.top = `${top}px`;
  element.style.width = `${width}px`;
  element.style.height = `${height}px`;
  element.style.pointerEvents = "none";
  element.style.zIndex = "50";

  return element;
};

const appendOverlayLayer = (
  doc: Document,
  overlays: OverlayItem[],
  contentWidth: number,
  contentHeight: number,
) => {
  const layer = doc.createElement("div");
  layer.style.position = "absolute";
  layer.style.left = "0";
  layer.style.top = "0";
  layer.style.width = `${contentWidth}px`;
  layer.style.height = `${contentHeight}px`;
  layer.style.pointerEvents = "none";
  layer.style.zIndex = "1000";

  doc.body.style.position = "relative";

  for (const overlay of overlays) {
    const overlayElement = createOverlayElement(
      doc,
      overlay,
      contentWidth,
      contentHeight,
    );
    if (overlayElement) {
      layer.appendChild(overlayElement);
    }
  }

  doc.body.appendChild(layer);
  return layer;
};

const findPreviewFrame = (pageId: string): HTMLIFrameElement | null => {
  const frames = Array.from(
    document.querySelectorAll<HTMLIFrameElement>("iframe[data-preview-page-id]"),
  );

  return (
    frames.find((frame) => frame.getAttribute("data-preview-page-id") === pageId) ??
    null
  );
};

const captureRenderedPreviewFrame = async (
  pageId: string,
  overlays: OverlayItem[],
): Promise<{
  canvas: HTMLCanvasElement;
  captureHeight: number;
  captureWidth: number;
} | null> => {
  const iframe = findPreviewFrame(pageId);
  const iframeDoc = iframe?.contentDocument;

  if (!iframe || !iframeDoc?.documentElement || !iframeDoc.body) {
    return null;
  }

  await waitForFonts(iframeDoc);
  await waitForImages(Array.from(iframeDoc.images));

  const { contentWidth, contentHeight } = getRenderedPreviewSize(
    iframe,
    iframeDoc,
  );
  const captureWidth = Math.max(1, Math.ceil(contentWidth));
  const captureHeight = Math.max(1, Math.ceil(contentHeight));
  const root = iframeDoc.documentElement;
  const originalBodyPosition = iframeDoc.body.style.position;
  const originalRootTransform = root.style.transform;
  const originalRootWidth = root.style.width;
  const originalRootHeight = root.style.height;
  const originalBodyWidth = iframeDoc.body.style.width;
  const originalBodyHeight = iframeDoc.body.style.height;
  const originalIframeWidth = iframe.style.width;
  const originalIframeHeight = iframe.style.height;
  const overlayLayer = appendOverlayLayer(
    iframeDoc,
    overlays,
    contentWidth,
    contentHeight,
  );

  try {
    await waitForImages(Array.from(overlayLayer.querySelectorAll("img")));
    root.style.transform = "none";
    root.style.width = `${contentWidth}px`;
    root.style.height = `${contentHeight}px`;
    iframeDoc.body.style.width = `${contentWidth}px`;
    iframeDoc.body.style.height = `${contentHeight}px`;
    iframe.style.width = `${captureWidth}px`;
    iframe.style.height = `${captureHeight}px`;
    await nextFrame();

    const canvas = await html2canvas(root, {
      scale: CAPTURE_SCALE,
      useCORS: true,
      allowTaint: false,
      backgroundColor: "#ffffff",
      logging: false,
      width: captureWidth,
      height: captureHeight,
      scrollX: 0,
      scrollY: 0,
      windowWidth: captureWidth,
      windowHeight: captureHeight,
    });

    return { canvas, captureWidth, captureHeight };
  } finally {
    overlayLayer.remove();
    iframeDoc.body.style.position = originalBodyPosition;
    root.style.transform = originalRootTransform;
    root.style.width = originalRootWidth;
    root.style.height = originalRootHeight;
    iframeDoc.body.style.width = originalBodyWidth;
    iframeDoc.body.style.height = originalBodyHeight;
    iframe.style.width = originalIframeWidth;
    iframe.style.height = originalIframeHeight;
  }
};

async function captureHtmlToCanvas(
  pageId: string,
  htmlContent: string,
  overlays: OverlayItem[],
): Promise<{
  canvas: HTMLCanvasElement;
  captureHeight: number;
  captureWidth: number;
}> {
  const previewCapture = await captureRenderedPreviewFrame(pageId, overlays);
  if (previewCapture) {
    return previewCapture;
  }

  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.left = "-10000px";
  iframe.style.top = "0";
  iframe.style.width = `${EXPORT_PAGE_WIDTH}px`;
  iframe.style.height = "1px";
  iframe.style.border = "none";
  iframe.style.backgroundColor = "#ffffff";
  iframe.style.pointerEvents = "none";

  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!iframeDoc) {
    document.body.removeChild(iframe);
    throw new Error("Unable to construct export document context.");
  }

  iframeDoc.open();
  iframeDoc.write(htmlContent);
  iframeDoc.close();

  try {
    await waitForFrameLoad(iframe, iframeDoc);
    await waitForFonts(iframeDoc);
    await waitForImages(Array.from(iframeDoc.images));

    const { contentWidth, contentHeight } = applyPreviewScale(
      iframeDoc,
      EXPORT_PAGE_WIDTH,
    );
    const captureWidth = Math.max(1, Math.ceil(contentWidth));
    const captureHeight = Math.max(1, Math.ceil(contentHeight));

    iframeDoc.documentElement.style.transform = "none";
    iframeDoc.documentElement.style.width = `${contentWidth}px`;
    iframeDoc.documentElement.style.height = `${contentHeight}px`;
    iframeDoc.body.style.width = `${contentWidth}px`;
    iframeDoc.body.style.height = `${contentHeight}px`;
    iframe.style.width = `${captureWidth}px`;
    iframe.style.height = `${captureHeight}px`;

    const overlayLayer = appendOverlayLayer(
      iframeDoc,
      overlays,
      contentWidth,
      contentHeight,
    );
    await waitForImages(Array.from(overlayLayer.querySelectorAll("img")));

    await nextFrame();

    const canvas = await html2canvas(iframeDoc.documentElement, {
      scale: CAPTURE_SCALE,
      useCORS: true,
      allowTaint: false,
      backgroundColor: "#ffffff",
      logging: false,
      width: captureWidth,
      height: captureHeight,
      scrollX: 0,
      scrollY: 0,
      windowWidth: captureWidth,
      windowHeight: captureHeight,
    });

    return {
      canvas,
      captureWidth,
      captureHeight,
    };
  } catch (err) {
    console.error("html2canvas capture engine failure:", err);
    throw err;
  } finally {
    document.body.removeChild(iframe);
  }
}

interface PageExportInput {
  pageId: string;
  html: string;
  overlays: OverlayItem[];
  editorPageWidth: number;
  editorPageHeight: number;
}

export async function generatePdfFromHtmlPages(
  pages: PageExportInput[],
): Promise<Uint8Array> {
  if (pages.length === 0) throw new Error("No pages found to build export.");

  let pdf: jsPDF | null = null;

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    if (!page) continue;

    const { canvas, captureHeight, captureWidth } = await captureHtmlToCanvas(
      page.pageId,
      page.html,
      page.overlays,
    );

    const pdfW = captureWidth;
    const pdfH = captureHeight;
    const orientation = pdfW >= pdfH ? "landscape" : "portrait";

    if (i === 0) {
      pdf = new jsPDF({
        orientation,
        unit: "px",
        format: [pdfW, pdfH],
        hotfixes: ["px_scaling"],
      });
    } else {
      pdf!.addPage([pdfW, pdfH], orientation);
    }

    const imgData = canvas.toDataURL("image/jpeg", 0.95);
    pdf!.addImage(imgData, "JPEG", 0, 0, pdfW, pdfH, undefined, "FAST");
  }

  const pdfBlob = pdf!.output("arraybuffer");
  return new Uint8Array(pdfBlob);
}
