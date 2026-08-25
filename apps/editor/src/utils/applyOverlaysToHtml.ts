import type { OverlayItem } from "../types/editor";

const PAGE_TARGET_SELECTOR =
  'div[id^="page-container"] > div, .pf, .page, #page-container';

const serializeDocument = (doc: Document, originalHtml: string): string => {
  const doctype = /^\s*<!doctype/i.test(originalHtml) ? "<!DOCTYPE html>" : "";
  return `${doctype}${doc.documentElement.outerHTML}`;
};

const parsePx = (value: string | null | undefined) => {
  if (!value) return 0;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
};

const getStylePx = (element: HTMLElement | null, property: string) => {
  if (!element) return 0;
  return parsePx(element.style.getPropertyValue(property));
};

/**
 * Reads the natural (unscaled) page dimensions from the HTML document itself.
 * Used as a fallback when no external size is provided.
 */
const getPageSizeFromDoc = (doc: Document) => {
  const pageElement = doc.querySelector(
    PAGE_TARGET_SELECTOR,
  ) as HTMLElement | null;
  const body = doc.body;
  const root = doc.documentElement;

  const width =
    parsePx(pageElement?.getAttribute("data-page-width")) ||
    getStylePx(pageElement, "width") ||
    getStylePx(body, "width") ||
    getStylePx(root, "width") ||
    820;
  const height =
    parsePx(pageElement?.getAttribute("data-page-height")) ||
    getStylePx(pageElement, "height") ||
    getStylePx(body, "height") ||
    getStylePx(root, "height") ||
    Math.round(width * Math.sqrt(2));

  return { width, height };
};

const createOverlayElement = (
  doc: Document,
  overlay: OverlayItem,
  pageWidth: number,
  pageHeight: number,
): HTMLElement | null => {
  const element = doc.createElement("div");
  const left = overlay.x * pageWidth;
  const top = overlay.y * pageHeight;
  const width = overlay.width * pageWidth;
  const height = overlay.height * pageHeight;

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

  element.setAttribute("data-export-overlay-id", overlay.id);
  element.style.position = "absolute";
  element.style.left = `${left}px`;
  element.style.top = `${top}px`;
  element.style.width = `${width}px`;
  element.style.height = `${height}px`;
  element.style.pointerEvents = "none";
  element.style.zIndex = "1000";

  return element;
};

/**
 * Injects overlay elements into an HTML page string.
 *
 * @param html           - The full HTML string for one page.
 * @param overlays       - All overlay items (will be filtered to this page).
 * @param pageId         - The page identifier used to filter overlays.
 * @param naturalWidth   - The natural (unscaled) content width in px that was
 *                         reported by HtmlPageFrame via onPageSize. Overlays
 *                         were placed relative to the preview container which
 *                         uses this same coordinate space, so we must use it
 *                         here too. Falls back to reading the HTML's CSS if
 *                         not supplied.
 * @param naturalHeight  - Same as naturalWidth but for height.
 */
export function applyOverlaysToHtml(
  html: string,
  overlays: OverlayItem[],
  pageId: string,
  naturalWidth?: number,
  naturalHeight?: number,
): string {
  const pageOverlays = overlays.filter((overlay) => overlay.pageId === pageId);

  if (pageOverlays.length === 0) {
    return html;
  }

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    // Prefer the caller-supplied natural dimensions (from HtmlPageFrame's
    // onPageSize callback).  Fall back to parsing the document's own CSS only
    // when no size has been recorded yet (e.g. first load or image-only pages).
    const docSize = getPageSizeFromDoc(doc);
    const pageWidth =
      naturalWidth && naturalWidth > 0 ? naturalWidth : docSize.width;
    const pageHeight =
      naturalHeight && naturalHeight > 0 ? naturalHeight : docSize.height;

    // Lock the document body to exactly the natural page dimensions so the
    // exported HTML never overflows and overlays land in the right spot.
    doc.body.style.position = "relative";
    doc.body.style.width = `${pageWidth}px`;
    doc.body.style.height = `${pageHeight}px`;
    doc.body.style.overflow = "hidden";
    doc.body.style.margin = "0";
    doc.body.style.padding = "0";
    doc.body.style.setProperty("-webkit-print-color-adjust", "exact");
    doc.body.style.setProperty("print-color-adjust", "exact");
    doc.body.style.setProperty("color-adjust", "exact");

    const overlayLayer = doc.createElement("div");
    overlayLayer.style.position = "absolute";
    overlayLayer.style.left = "0";
    overlayLayer.style.top = "0";
    overlayLayer.style.width = `${pageWidth}px`;
    overlayLayer.style.height = `${pageHeight}px`;
    overlayLayer.style.pointerEvents = "none";
    overlayLayer.style.zIndex = "1000";

    for (const overlay of pageOverlays) {
      const overlayElement = createOverlayElement(
        doc,
        overlay,
        pageWidth,
        pageHeight,
      );
      if (overlayElement) {
        overlayLayer.appendChild(overlayElement);
      }
    }

    doc.body.appendChild(overlayLayer);
    return serializeDocument(doc, html);
  } catch (error) {
    console.warn("Failed to inject overlays into HTML page:", error);
    return html;
  }
}
