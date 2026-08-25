import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { Plus, X } from "lucide-react";
import { Document, Page } from "react-pdf";
import type { PDFPageProxy } from "pdfjs-dist";
import { RippleButton } from "./ui/RippleButton";
import { useEditorStore } from "../store/editorStore";
import { PdfErrorBoundary } from "./PdfErrorBoundary";
import { GoogleAdSlot } from "./GoogleAdSlot";
import { pdfDocumentOptions } from "../lib/pdfjs";
import type {
  CombinedPageRef,
  OverlayItem,
  PdfFileItem,
} from "../types/editor";
import type { ToolKind } from "../types/editor";
import { buildHtmlDoc } from "../utils/buildHtmlDoc";

const ImagePagePreview = memo(
  ({ src, alt, width }: { src: string; alt: string; width: number }) => {
    return (
      <img
        src={src}
        alt={alt}
        className="block h-auto rounded"
        style={{ width: `${width}px`, maxWidth: "100%" }}
      />
    );
  },
);

const PdfPageCanvas = memo(
  ({
    fileUrl,
    sourcePage,
    width,
    pageIdentity,
    fallbackAspectRatio,
    onPageSize,
  }: {
    fileUrl: string;
    sourcePage: number;
    width: number;
    pageIdentity: string;
    fallbackAspectRatio: number;
    onPageSize?: (size: { width: number; height: number }) => void;
  }) => {
    const placeholderHeight = Math.max(
      1,
      Math.round(width * fallbackAspectRatio),
    );

    const handleLoadSuccess = useCallback(
      (page: PDFPageProxy) => {
        const viewport = page.getViewport({ scale: 1 });
        onPageSize?.({ width: viewport.width, height: viewport.height });
      },
      [onPageSize],
    );

    return (
      <Document
        key={pageIdentity}
        file={fileUrl}
        options={pdfDocumentOptions}
        loading={
          <div
            className="animate-pulse rounded bg-slate-100"
            style={{ width, height: placeholderHeight }}
          />
        }
        error={
          <div
            className="grid place-items-center rounded bg-rose-50 text-xs text-rose-400"
            style={{ width, height: placeholderHeight }}
          >
            Failed to render page
          </div>
        }
      >
        <Page
          pageNumber={sourcePage + 1}
          width={width}
          renderTextLayer={false}
          renderAnnotationLayer={false}
          className="rounded"
          onLoadSuccess={handleLoadSuccess}
        />
      </Document>
    );
  },
);

const mergeEditedBody = (originalHtml: string, editedBody: string) => {
  const trimmed = originalHtml.trim();
  if (!trimmed) {
    return editedBody;
  }

  const hasBody = /<body[\s>]/i.test(trimmed);
  const hasHtml = /<html[\s>]/i.test(trimmed);
  if (!hasBody && !hasHtml) {
    return editedBody;
  }

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(trimmed, "text/html");
    if (!doc.body) {
      return editedBody;
    }

    doc.body.innerHTML = editedBody;
    const html = doc.documentElement?.outerHTML ?? "";
    if (!html) {
      return editedBody;
    }

    const hasDoctype = /^\s*<!doctype/i.test(trimmed);
    return `${hasDoctype ? "<!DOCTYPE html>" : ""}${html}`;
  } catch (error) {
    console.warn("Failed to merge edited HTML:", error);
    return editedBody;
  }
};

const HtmlPageFrame = memo(
  ({
    pageId,
    html,
    width,
    height,
    isEditable,
    onPageSize,
    onHtmlChange,
  }: {
    pageId: string;
    html: string;
    width: number;
    height: number;
    isEditable?: boolean;
    onPageSize?: (size: { width: number; height: number }) => void;
    onHtmlChange?: (nextHtml: string) => void;
  }) => {
    const frameRef = useRef<HTMLIFrameElement | null>(null);
    const contentSizeRef = useRef<{ width: number; height: number } | null>(
      null,
    );
    const updateTimerRef = useRef<number | null>(null);
    const activeDocRef = useRef<Document | null>(null);
    const detachListenersRef = useRef<(() => void) | null>(null);
    const [srcDoc, setSrcDoc] = useState(() => buildHtmlDoc(html));

    const applyScale = useCallback(() => {
      const frame = frameRef.current;
      if (!frame) return;

      const doc = frame.contentDocument;
      if (!doc) return;

      const root = doc.documentElement;
      const body = doc.body;
      if (!root || !body) return;

      root.style.margin = "0";
      root.style.padding = "0";
      root.style.overflow = "hidden";
      root.style.transform = "";
      root.style.transformOrigin = "top left";
      body.style.margin = "0";
      body.style.padding = "0";
      body.style.overflow = "hidden";

      if (isEditable) {
        body.contentEditable = "true";
        body.style.cursor = "text";
        body.style.userSelect = "text";
        root.style.pointerEvents = "auto";
        body.style.pointerEvents = "auto";
      } else {
        body.contentEditable = "false";
        body.style.cursor = "default";
        body.style.userSelect = "none";
        root.style.pointerEvents = "none";
        body.style.pointerEvents = "none";
      }

      // Ensure links always have pointer-events enabled for tooltips
      const links = doc.querySelectorAll('a[href]');
      links.forEach((link) => {
        if (link instanceof HTMLElement) {
          link.style.pointerEvents = 'auto';
        }
      });

      if (!contentSizeRef.current) {
        root.style.width = "";
        root.style.height = "";
        body.style.width = "";
        body.style.height = "";

        const contentWidth = Math.max(root.scrollWidth, body.scrollWidth);
        const contentHeight = Math.max(root.scrollHeight, body.scrollHeight);

        if (!contentWidth || !contentHeight) return;

        contentSizeRef.current = {
          width: contentWidth,
          height: contentHeight,
        };
      }

      const contentWidth = contentSizeRef.current.width;
      const contentHeight = contentSizeRef.current.height;

      // Report the NATURAL (unscaled) content dimensions upward.
      // This is the coordinate space overlays use — NOT the scaled preview size.
      onPageSize?.({ width: contentWidth, height: contentHeight });

      const scale = width / contentWidth;
      root.style.width = `${contentWidth}px`;
      root.style.height = `${contentHeight}px`;
      body.style.width = `${contentWidth}px`;
      body.style.height = `${contentHeight}px`;
      root.style.transform = `scale(${scale})`;
    }, [width, onPageSize, isEditable]);

    useEffect(() => {
      if (isEditable) {
        return;
      }

      const frameId = window.requestAnimationFrame(() => {
        setSrcDoc(buildHtmlDoc(html));
      });

      return () => window.cancelAnimationFrame(frameId);
    }, [html, isEditable]);

    useEffect(() => {
      contentSizeRef.current = null;
      applyScale();
    }, [applyScale, srcDoc]);

    const captureEditedHtml = useCallback(() => {
      if (!onHtmlChange) return;
      const frame = frameRef.current;
      const doc = frame?.contentDocument;
      if (!doc || !doc.body) return;

      const preserveVisualTextStyle = (
        sourceElement: HTMLElement,
        targetElement: HTMLElement,
      ) => {
        const computed = doc.defaultView?.getComputedStyle(sourceElement);
        if (!computed) return;

        const styleProperties = [
          "color",
          "background-color",
          "font-family",
          "font-size",
          "font-style",
          "font-weight",
          "line-height",
          "letter-spacing",
          "text-align",
          "text-decoration",
          "text-transform",
          "vertical-align",
          "white-space",
        ];

        for (const property of styleProperties) {
          const value = computed.getPropertyValue(property);
          if (!value) continue;

          if (property === "background-color" && value === "rgba(0, 0, 0, 0)") {
            continue;
          }

          if (property === "text-decoration" && value === "none") {
            continue;
          }

          targetElement.style.setProperty(property, value);
        }

        if (sourceElement.tagName.toLowerCase() === "font") {
          const color = sourceElement.getAttribute("color");
          const face = sourceElement.getAttribute("face");

          if (color) {
            targetElement.style.color = color;
          }

          if (face) {
            targetElement.style.fontFamily = face;
          }

          targetElement.removeAttribute("color");
          targetElement.removeAttribute("face");
          targetElement.removeAttribute("size");
        }
      };

      const copyComputedStylesToClone = (
        sourceElement: HTMLElement,
        targetElement: HTMLElement,
      ) => {
        preserveVisualTextStyle(sourceElement, targetElement);

        const sourceChildren = Array.from(sourceElement.children);
        const targetChildren = Array.from(targetElement.children);

        sourceChildren.forEach((sourceChild, index) => {
          const targetChild = targetChildren[index];
          if (
            sourceChild instanceof HTMLElement &&
            targetChild instanceof HTMLElement
          ) {
            copyComputedStylesToClone(sourceChild, targetChild);
          }
        });
      };

      const bodyClone = doc.body.cloneNode(true) as HTMLElement;
      copyComputedStylesToClone(doc.body, bodyClone);

      const editedBody = bodyClone.innerHTML ?? "";
      const nextHtml = mergeEditedBody(html, editedBody);
      onHtmlChange(nextHtml);
    }, [html, onHtmlChange]);

    const scheduleUpdate = useCallback(() => {
      if (!onHtmlChange) return;
      if (updateTimerRef.current) {
        window.clearTimeout(updateTimerRef.current);
      }
      updateTimerRef.current = window.setTimeout(() => {
        updateTimerRef.current = null;
        captureEditedHtml();
      }, 300);
    }, [captureEditedHtml, onHtmlChange]);

    const flushUpdate = useCallback(() => {
      if (updateTimerRef.current) {
        window.clearTimeout(updateTimerRef.current);
        updateTimerRef.current = null;
      }
      captureEditedHtml();
    }, [captureEditedHtml]);

    const attachListeners = useCallback(() => {
      if (!isEditable || !onHtmlChange) {
        return;
      }

      const frame = frameRef.current;
      const doc = frame?.contentDocument;
      if (!doc || activeDocRef.current === doc) {
        return;
      }

      detachListenersRef.current?.();
      activeDocRef.current = doc;

      const handleInput = () => scheduleUpdate();
      const handleBlur = () => flushUpdate();

      doc.addEventListener("input", handleInput, true);
      doc.addEventListener("blur", handleBlur, true);

      detachListenersRef.current = () => {
        doc.removeEventListener("input", handleInput, true);
        doc.removeEventListener("blur", handleBlur, true);
      };
    }, [flushUpdate, isEditable, onHtmlChange, scheduleUpdate]);

    useEffect(() => {
      if (!isEditable || !onHtmlChange) {
        detachListenersRef.current?.();
        detachListenersRef.current = null;
        activeDocRef.current = null;
        return;
      }

      attachListeners();

      return () => {
        flushUpdate();
        detachListenersRef.current?.();
        detachListenersRef.current = null;
        activeDocRef.current = null;
      };
    }, [attachListeners, flushUpdate, isEditable, onHtmlChange]);

    useEffect(() => {
      return () => {
        if (updateTimerRef.current) {
          window.clearTimeout(updateTimerRef.current);
        }
      };
    }, []);

    const handleLoad = useCallback(() => {
      applyScale();
      attachListeners();
    }, [applyScale, attachListeners]);

    return (
      <iframe
        ref={frameRef}
        title="Converted PDF page"
        data-preview-page-id={pageId}
        srcDoc={srcDoc}
        className="block h-full w-full rounded"
        style={{ width, height, border: "none" }}
        sandbox={
          isEditable ? "allow-same-origin allow-scripts" : "allow-same-origin"
        }
        onLoad={handleLoad}
      />
    );
  },
);

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const PdfImageOverlayLayer = memo(
  ({
    docId,
    pageIndex,
    pageWidth,
    pageHeight,
    activeTool,
    overlays,
    signatureImage,
    editorImage,
    currentHighlightColor,
    selectedOverlayId,
    pageId,
    onSelectOverlay,
    onAddOverlay,
    onUpdateOverlay,
    onRemoveOverlay,
  }: {
    docId: string;
    pageIndex: number;
    pageWidth: number;
    pageHeight: number;
    activeTool: ToolKind | null | undefined;
    overlays: OverlayItem[];
    signatureImage?: string | null;
    editorImage?: string | null;
    currentHighlightColor?: string;
    selectedOverlayId: string | null;
    pageId: string;
    onSelectOverlay: (id: string | null) => void;
    onAddOverlay: (overlay: OverlayItem) => void;
    onUpdateOverlay: (id: string, patch: Partial<OverlayItem>) => void;
    onRemoveOverlay: (id: string) => void;
  }) => {
    const isPlacementTool =
      activeTool === "signature" ||
      activeTool === "image" ||
      activeTool === "highlight";
    const dragRef = useRef<{
      id: string;
      startX: number;
      startY: number;
      originX: number;
      originY: number;
      width: number;
      height: number;
    } | null>(null);
    const resizeRef = useRef<{
      id: string;
      startX: number;
      startY: number;
      originWidth: number;
      originHeight: number;
      x: number;
      y: number;
    } | null>(null);
    const highlightDraftRef = useRef<{
      id: string;
      rect: DOMRect;
      startX: number;
      startY: number;
      x: number;
      y: number;
      width: number;
      height: number;
    } | null>(null);

    // const getNormalizedPoint = (
    //   event: ReactMouseEvent<HTMLDivElement>,
    //   rect: DOMRect,
    // ) => {
    //   const x = clamp((event.clientX - rect.left) / rect.width, 0, 1);
    //   const y = clamp((event.clientY - rect.top) / rect.height, 0, 1);
    //   return { x, y };
    // };

    const beginHighlightDrag = (event: ReactMouseEvent<HTMLDivElement>) => {
      if (activeTool !== "highlight") {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      const rect = event.currentTarget.getBoundingClientRect();
      const x = clamp((event.clientX - rect.left) / rect.width, 0, 1);
      const y = clamp((event.clientY - rect.top) / rect.height, 0, 1);
      const id = crypto.randomUUID();

      highlightDraftRef.current = {
        id,
        rect,
        startX: x,
        startY: y,
        x,
        y,
        width: 0,
        height: 0,
      };

      const overlay: OverlayItem = {
        id,
        docId,
        type: "highlight",
        pageIndex,
        pageId,
        x,
        y,
        width: 0,
        height: 0,
        highlightColor: currentHighlightColor,
      };

      onAddOverlay(overlay);
      onSelectOverlay(id);
    };

    const handleAddOnClick = (event: ReactMouseEvent<HTMLDivElement>) => {
      if (!isPlacementTool || activeTool === "highlight") {
        return;
      }

      const selectedAsset =
        activeTool === "signature" ? signatureImage : editorImage;
      if (!selectedAsset) {
        window.alert(
          activeTool === "signature"
            ? "Upload a signature image first."
            : "Upload an image first.",
        );
        return;
      }

      const rect = event.currentTarget.getBoundingClientRect();
      const width = 0.24;
      const height = activeTool === "signature" ? 0.1 : 0.2;
      const normalizedX = clamp((event.clientX - rect.left) / rect.width, 0, 1);
      const normalizedY = clamp((event.clientY - rect.top) / rect.height, 0, 1);

      const overlay: OverlayItem = {
        id: crypto.randomUUID(),
        docId,
        type: activeTool,
        pageIndex,
        pageId: pageId,
        x: clamp(normalizedX - width / 2, 0, 1 - width),
        y: clamp(normalizedY - height / 2, 0, 1 - height),
        width,
        height,
        imageDataUrl: selectedAsset,
      };

      onAddOverlay(overlay);
      onSelectOverlay(overlay.id);
    };

    const beginDrag = (
      event: ReactMouseEvent<HTMLDivElement>,
      overlay: OverlayItem,
    ) => {
      event.preventDefault();
      event.stopPropagation();
      dragRef.current = {
        id: overlay.id,
        startX: event.clientX,
        startY: event.clientY,
        originX: overlay.x,
        originY: overlay.y,
        width: overlay.width,
        height: overlay.height,
      };
      onSelectOverlay(overlay.id);
    };

    const beginResize = (
      event: ReactMouseEvent<HTMLButtonElement>,
      overlay: OverlayItem,
    ) => {
      event.preventDefault();
      event.stopPropagation();
      resizeRef.current = {
        id: overlay.id,
        startX: event.clientX,
        startY: event.clientY,
        originWidth: overlay.width,
        originHeight: overlay.height,
        x: overlay.x,
        y: overlay.y,
      };
      onSelectOverlay(overlay.id);
    };

    const handlePointerMove = (event: ReactMouseEvent<HTMLDivElement>) => {
      const highlightDraft = highlightDraftRef.current;
      if (highlightDraft) {
        const rect = event.currentTarget.getBoundingClientRect();
        const x = clamp((event.clientX - rect.left) / rect.width, 0, 1);
        const y = clamp((event.clientY - rect.top) / rect.height, 0, 1);
        const left = Math.min(highlightDraft.startX, x);
        const top = Math.min(highlightDraft.startY, y);
        const width = Math.abs(x - highlightDraft.startX);
        const height = Math.abs(y - highlightDraft.startY);

        highlightDraft.x = left;
        highlightDraft.y = top;
        highlightDraft.width = width;
        highlightDraft.height = height;

        onUpdateOverlay(highlightDraft.id, {
          x: left,
          y: top,
          width,
          height,
          highlightColor: currentHighlightColor,
        });
        return;
      }

      const activeDrag = dragRef.current;
      if (activeDrag) {
        const deltaX = (event.clientX - activeDrag.startX) / pageWidth;
        const deltaY = (event.clientY - activeDrag.startY) / pageHeight;
        onUpdateOverlay(activeDrag.id, {
          x: clamp(activeDrag.originX + deltaX, 0, 1 - activeDrag.width),
          y: clamp(activeDrag.originY + deltaY, 0, 1 - activeDrag.height),
        });
      }

      const activeResize = resizeRef.current;
      if (activeResize) {
        const deltaX = (event.clientX - activeResize.startX) / pageWidth;
        const deltaY = (event.clientY - activeResize.startY) / pageHeight;
        const nextWidth = clamp(
          activeResize.originWidth + deltaX,
          0.08,
          1 - activeResize.x,
        );
        const nextHeight = clamp(
          activeResize.originHeight + deltaY,
          0.06,
          1 - activeResize.y,
        );
        onUpdateOverlay(activeResize.id, {
          width: nextWidth,
          height: nextHeight,
        });
      }
    };

    const endInteractions = () => {
      const highlightDraft = highlightDraftRef.current;
      if (highlightDraft) {
        highlightDraftRef.current = null;
        if (highlightDraft.width === 0 || highlightDraft.height === 0) {
          onRemoveOverlay(highlightDraft.id);
          onSelectOverlay(null);
        }
      }
      dragRef.current = null;
      resizeRef.current = null;
    };

    return (
      <div
        className="absolute inset-1 z-30"
        style={{
          width: pageWidth,
          height: pageHeight,
          pointerEvents: isPlacementTool ? "auto" : "none",
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            onSelectOverlay(null);
          }
        }}
        onMouseMove={handlePointerMove}
        onMouseUp={endInteractions}
        onMouseLeave={endInteractions}
      >
        {isPlacementTool ? (
          <div
            className="absolute inset-0"
            style={{ cursor: "crosshair" }}
            onClick={handleAddOnClick}
            onMouseDown={beginHighlightDrag}
          />
        ) : null}

        {overlays.map((overlay) => {
          const isSelected = selectedOverlayId === overlay.id;

          return (
            <div
              key={overlay.id}
              className="absolute"
              style={{
                left: `${overlay.x * 100}%`,
                top: `${overlay.y * 100}%`,
                width: `${overlay.width * 100}%`,
                height: `${overlay.height * 100}%`,
                zIndex: isSelected ? 60 : 50,
              }}
            >
              <div
                className={`group relative h-full w-full rounded border ${overlay.type === "highlight"
                  ? "bg-transparent border-transparent"
                  : "bg-white/20"
                  } ${isSelected
                    ? "border-blue-500 shadow-md"
                    : "border-transparent"
                  }`}
                style={{
                  backgroundColor:
                    overlay.type === "highlight"
                      ? overlay.highlightColor
                      : undefined,
                }}
                onMouseDown={(event) => {
                  if (!isPlacementTool) {
                    return;
                  }

                  beginDrag(event, overlay);
                }}
                onClick={(event) => {
                  event.stopPropagation();
                  if (isPlacementTool) {
                    onSelectOverlay(overlay.id);
                  }
                }}
              >
                {overlay.imageDataUrl ? (
                  <img
                    src={overlay.imageDataUrl}
                    alt={`${overlay.type} overlay`}
                    className="h-full w-full object-contain"
                    draggable={false}
                  />
                ) : null}

                {isPlacementTool && isSelected ? (
                  <>
                    <button
                      type="button"
                      className="absolute -top-2 -right-2 grid h-5 w-5 place-items-center rounded-full border border-rose-300 bg-white text-rose-600 shadow"
                      onClick={(event) => {
                        event.stopPropagation();
                        onRemoveOverlay(overlay.id);
                        onSelectOverlay(null);
                      }}
                      aria-label="Remove overlay"
                      title="Remove"
                    >
                      <X size={12} />
                    </button>

                    {overlay.type !== "highlight" ? (
                      <button
                        type="button"
                        className="absolute -bottom-2 -right-2 h-4 w-4 cursor-se-resize rounded-sm border border-blue-400 bg-blue-500"
                        onMouseDown={(event) => beginResize(event, overlay)}
                        aria-label="Resize overlay"
                        title="Resize"
                      />
                    ) : null}
                  </>
                ) : null}
              </div>
            </div>
          );
        })}

        {activeTool === "signature" ||
          activeTool === "image" ||
          activeTool === "highlight" ? (
          <div className="pointer-events-none absolute right-2 bottom-2 rounded bg-black/60 px-2 py-1 text-[10px] text-white">
            Click to place. Drag to move. Corner to resize.
          </div>
        ) : null}
      </div>
    );
  },
);

interface PreviewPaneProps {
  documents: PdfFileItem[];
  combinedPages: CombinedPageRef[];
  activePageId: string | null;
  requestedPageId: string | null;
  onActivatePage: (pageId: string) => void;
  onScrollHandled: () => void;
  activeTool?: ToolKind | null;
  currentHighlightColor?: string;
  signatureImage?: string | null;
  editorImage?: string | null;
  disabled?: boolean;
  onAddFiles: () => void;
}

export function PreviewPane({
  documents,
  combinedPages,
  activePageId,
  requestedPageId,
  onActivatePage,
  onScrollHandled,
  activeTool,
  currentHighlightColor,
  signatureImage,
  editorImage,
  onAddFiles,
  disabled = false,
}: PreviewPaneProps) {
  const zoom = useEditorStore((state) => state.previewZoom);
  const setPreviewZoom = useEditorStore((state) => state.setPreviewZoom);
  const overlays = useEditorStore((state) => state.overlays);
  const addOverlay = useEditorStore((state) => state.addOverlay);
  const updateOverlay = useEditorStore((state) => state.updateOverlay);
  const removeOverlay = useEditorStore((state) => state.removeOverlay);
  // ─── NEW: persist natural page sizes so App.tsx can use them at export time ─
  const setPageSize = useEditorStore((state) => state.setPageSize);

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const pageRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [selectedOverlayId, setSelectedOverlayId] = useState<string | null>(
    null,
  );

  const effectiveSelectedOverlayId =
    activeTool === "signature" ||
      activeTool === "image" ||
      activeTool === "highlight"
      ? selectedOverlayId
      : null;

  const handleAddOverlay = useCallback(
    (overlay: OverlayItem) => {
      addOverlay(overlay);
    },
    [addOverlay],
  );

  const handleUpdateOverlay = useCallback(
    (id: string, patch: Partial<OverlayItem>) => {
      updateOverlay(id, patch);
    },
    [updateOverlay],
  );

  const handleRemoveOverlay = useCallback(
    (id: string) => {
      removeOverlay(id);
    },
    [removeOverlay],
  );

  const handleHtmlChange = useCallback(
    (docId: string, sourcePage: number, nextHtml: string) => {
      const state = useEditorStore.getState();
      const doc = state.documents.find((item) => item.id === docId);
      const pages = doc?.htmlPages;
      const current = pages?.[sourcePage];
      if (!pages || !current || current.html === nextHtml) {
        return;
      }

      const updatedPages = pages.map((page, index) =>
        index === sourcePage ? { ...page, html: nextHtml } : page,
      );

      state.setDocumentHtmlPages(docId, updatedPages);
    },
    [],
  );

  const docById = useMemo(() => {
    const map: Record<string, PdfFileItem> = {};
    for (const doc of documents) {
      map[doc.id] = doc;
    }
    return map;
  }, [documents]);

  const pdfBlobUrlByDocId = useMemo(() => {
    const map: Record<string, string> = {};

    for (const doc of documents) {
      if (doc.sourceType !== "pdf" || doc.bytes.length === 0) {
        continue;
      }

      const blob = new Blob([new Uint8Array(doc.bytes)], {
        type: "application/pdf",
      });
      map[doc.id] = URL.createObjectURL(blob);
    }

    return map;
  }, [documents]);

  useEffect(() => {
    return () => {
      for (const url of Object.values(pdfBlobUrlByDocId)) {
        URL.revokeObjectURL(url);
      }
    };
  }, [pdfBlobUrlByDocId]);

  const handleZoomIn = () => setPreviewZoom(Math.min(zoom + 10, 150));
  const handleZoomOut = () => setPreviewZoom(Math.max(zoom - 10, 50));
  const handleZoomReset = () => setPreviewZoom(100);
  const isPreviewDisabled = disabled || documents.length === 0;

  useEffect(() => {
    if (!requestedPageId) return;
    const element = pageRefs.current[requestedPageId];
    if (!element) return;
    element.scrollIntoView({ behavior: "smooth", block: "center" });
    onScrollHandled();
  }, [requestedPageId, onScrollHandled]);

  useEffect(() => {
    const root = scrollContainerRef.current;
    if (!root) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (left, right) => right.intersectionRatio - left.intersectionRatio,
          );
        const next = visibleEntries[0]?.target.getAttribute("data-page-id");
        if (next && next !== activePageId) {
          onActivatePage(next);
        }
      },
      { root, threshold: [0.35, 0.5, 0.7, 0.85] },
    );

    const elements = Object.values(pageRefs.current).filter(
      (el): el is HTMLDivElement => !!el,
    );
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [combinedPages, activePageId, onActivatePage]);

  const [pageAspectRatioById, setPageAspectRatioById] = useState<
    Record<string, number>
  >({});

  const handlePageSize = useCallback(
    (pageId: string, size: { width: number; height: number }) => {
      if (!isFinite(size.width) || !isFinite(size.height) || size.width <= 0) {
        return;
      }

      // ─── NEW: save the natural content size into the store ─────────────────
      // applyOverlaysToHtml and wrapHtmlForPdfExport will read this during
      // export so overlays land at exactly the right coordinates.
      setPageSize(pageId, size);

      const aspectRatio = size.height / size.width;
      setPageAspectRatioById((prev) => {
        const current = prev[pageId];
        if (current && Math.abs(current - aspectRatio) < 0.0001) {
          return prev;
        }
        return { ...prev, [pageId]: aspectRatio };
      });
    },
    [setPageSize],
  );

  const basePageWidth = 820;
  const defaultAspectRatio = Math.sqrt(2);
  const pageWidth = Math.floor((basePageWidth * zoom) / 100);

  return (
    <main className="relative flex h-[94vh] items-start justify-center bg-white py-[18px]">
      <div
        ref={scrollContainerRef}
        className="relative flex h-full w-fit flex-col overflow-auto no-scrollbar"
      >
        <div className="flex flex-col items-center gap-4 py-2">
          {combinedPages.length > 0 ? (
            <>
              {combinedPages.map((pageRef, index) => {
                const doc = docById[pageRef.docId];
                if (!doc) return null;

                const isActive = activePageId === pageRef.id;
                const fileUrl = pdfBlobUrlByDocId[pageRef.docId];
                const htmlPage = doc.htmlPages?.[pageRef.sourcePage];
                const pageAspectRatio =
                  pageAspectRatioById[pageRef.id] ?? defaultAspectRatio;
                const pageHeight = Math.floor(pageWidth * pageAspectRatio);
                const pageOverlays = overlays.filter((overlay) => {
                  return overlay.pageId === pageRef.id;
                });
                const isPlacementTool =
                  activeTool === "signature" ||
                  activeTool === "image" ||
                  activeTool === "highlight";
                const showOverlayLayer =
                  pageOverlays.length > 0 || isPlacementTool;

                return (
                  <div
                    key={pageRef.id}
                    ref={(el) => {
                      pageRefs.current[pageRef.id] = el;
                    }}
                    data-page-id={pageRef.id}
                    className="relative w-fit"
                  >
                    <div className="absolute top-2 right-2 z-20 flex items-center gap-1">
                      <span className="rounded bg-white/90 px-1.5 py-0.5 text-[10px] text-slate-600">
                        {index + 1}
                      </span>
                    </div>

                    {doc.sourceType === "image" ? (
                      <div
                        className={`relative rounded-md border-2 bg-white p-1 shadow-[0_10px_32px_rgba(18,28,45,0.12)] ${isActive ? "border-blue-400" : "border-transparent"
                          }`}
                        onClick={() => onActivatePage(pageRef.id)}
                      >
                        {doc.previewImageDataUrl ? (
                          <ImagePagePreview
                            src={doc.previewImageDataUrl}
                            alt={doc.name}
                            width={pageWidth}
                          />
                        ) : (
                          <div
                            className="grid place-items-center rounded bg-slate-50 text-xs text-slate-400"
                            style={{ width: pageWidth, height: pageHeight }}
                          >
                            Loading image…
                          </div>
                        )}
                      </div>
                    ) : doc.sourceType === "pdf" && htmlPage ? (
                      <div
                        className={`relative overflow-hidden rounded-md border-2 bg-white p-1 shadow-[0_10px_32px_rgba(18,28,45,0.12)] ${isActive ? "border-blue-400" : "border-transparent"
                          }`}
                        style={{ width: pageWidth + 8, height: pageHeight + 8 }}
                        onClick={() => onActivatePage(pageRef.id)}
                      >
                        <div
                          className={`absolute inset-1 z-0 overflow-hidden rounded ${activeTool === "edit"
                            ? "pointer-events-auto"
                            : "pointer-events-none"
                            }`}
                          style={{ width: pageWidth, height: pageHeight }}
                        >
                          <HtmlPageFrame
                            pageId={pageRef.id}
                            html={htmlPage.html}
                            width={pageWidth}
                            height={pageHeight}
                            isEditable={activeTool === "edit"}
                            onPageSize={(size) =>
                              handlePageSize(pageRef.id, size)
                            }
                            onHtmlChange={(nextHtml) =>
                              handleHtmlChange(
                                pageRef.docId,
                                pageRef.sourcePage,
                                nextHtml,
                              )
                            }
                          />
                        </div>

                        {showOverlayLayer ? (
                          <PdfImageOverlayLayer
                            docId={pageRef.docId}
                            pageIndex={index}
                            pageId={pageRef.id}
                            pageWidth={pageWidth}
                            pageHeight={pageHeight}
                            activeTool={activeTool}
                            overlays={pageOverlays}
                            signatureImage={signatureImage}
                            editorImage={editorImage}
                            currentHighlightColor={currentHighlightColor}
                            selectedOverlayId={effectiveSelectedOverlayId}
                            onSelectOverlay={setSelectedOverlayId}
                            onAddOverlay={handleAddOverlay}
                            onUpdateOverlay={handleUpdateOverlay}
                            onRemoveOverlay={handleRemoveOverlay}
                          />
                        ) : null}
                      </div>
                    ) : doc.sourceType === "pdf" && fileUrl ? (
                      <div
                        className={`relative overflow-hidden rounded-md border-2 bg-white p-1 shadow-[0_10px_32px_rgba(18,28,45,0.12)] ${isActive ? "border-blue-400" : "border-transparent"
                          }`}
                        style={{ width: pageWidth + 8, height: pageHeight + 8 }}
                        onClick={() => onActivatePage(pageRef.id)}
                      >
                        <div
                          className="pointer-events-none absolute inset-1 z-0 overflow-hidden rounded"
                          style={{ width: pageWidth, height: pageHeight }}
                        >
                          <PdfErrorBoundary
                            pageWidth={pageWidth}
                            pageHeight={pageHeight}
                            resetKey={`${pageRef.id}:${index}:${pageWidth}:${fileUrl}`}
                          >
                            <PdfPageCanvas
                              fileUrl={fileUrl}
                              sourcePage={pageRef.sourcePage}
                              width={pageWidth}
                              pageIdentity={`${pageRef.id}:${index}`}
                              fallbackAspectRatio={pageAspectRatio}
                              onPageSize={(size) =>
                                handlePageSize(pageRef.id, size)
                              }
                            />
                          </PdfErrorBoundary>
                        </div>

                        {showOverlayLayer ? (
                          <PdfImageOverlayLayer
                            docId={pageRef.docId}
                            pageIndex={index}
                            pageId={pageRef.id}
                            pageWidth={pageWidth}
                            pageHeight={pageHeight}
                            activeTool={activeTool}
                            overlays={pageOverlays}
                            signatureImage={signatureImage}
                            editorImage={editorImage}
                            currentHighlightColor={currentHighlightColor}
                            selectedOverlayId={effectiveSelectedOverlayId}
                            onSelectOverlay={setSelectedOverlayId}
                            onAddOverlay={handleAddOverlay}
                            onUpdateOverlay={handleUpdateOverlay}
                            onRemoveOverlay={handleRemoveOverlay}
                          />
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </>
          ) : (
            <div className="flex h-[88.5vh] w-[820px] flex-col items-center justify-center bg-white px-10 py-8">

              {/* ── Welcome header ── */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-50 mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10 9 9 9 8 9"/>
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-slate-700 m-0">AcmePDF Editor</h2>
                <p className="mt-1.5 text-sm text-slate-400">
                  Free online PDF tools — no sign-up, no downloads required.
                </p>
              </div>

              {/* ── Upload button ── */}
              <RippleButton
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 mb-8 cursor-pointer"
                onClick={onAddFiles}
              >
                <Plus size={15} />
                Upload your PDF
              </RippleButton>

              {/* ── Feature grid ── */}
              <div className="grid grid-cols-3 gap-3 w-full max-w-[620px] mb-8">
                <div className="flex flex-col items-center gap-1.5 rounded-xl border border-[#e8edf5] bg-[#f8faff] px-4 py-4 text-center">
                  <span className="text-xl">✏️</span>
                  <span className="text-xs font-semibold text-slate-700">Edit Text</span>
                  <span className="text-[11px] text-slate-400 leading-snug">Click any text in your PDF to modify it directly</span>
                </div>
                <div className="flex flex-col items-center gap-1.5 rounded-xl border border-[#e8edf5] bg-[#f8faff] px-4 py-4 text-center">
                  <span className="text-xl">🔍</span>
                  <span className="text-xs font-semibold text-slate-700">Highlight</span>
                  <span className="text-[11px] text-slate-400 leading-snug">Mark important sections with color highlights</span>
                </div>
                <div className="flex flex-col items-center gap-1.5 rounded-xl border border-[#e8edf5] bg-[#f8faff] px-4 py-4 text-center">
                  <span className="text-xl">✍️</span>
                  <span className="text-xs font-semibold text-slate-700">Signature</span>
                  <span className="text-[11px] text-slate-400 leading-snug">Upload and insert your signature anywhere</span>
                </div>
                <div className="flex flex-col items-center gap-1.5 rounded-xl border border-[#e8edf5] bg-[#f8faff] px-4 py-4 text-center">
                  <span className="text-xl">🖼️</span>
                  <span className="text-xs font-semibold text-slate-700">Add Image</span>
                  <span className="text-[11px] text-slate-400 leading-snug">Insert and resize images or logos on any page</span>
                </div>
                <div className="flex flex-col items-center gap-1.5 rounded-xl border border-[#e8edf5] bg-[#f8faff] px-4 py-4 text-center">
                  <span className="text-xl">📋</span>
                  <span className="text-xs font-semibold text-slate-700">Merge PDFs</span>
                  <span className="text-[11px] text-slate-400 leading-snug">Combine multiple PDF files into one document</span>
                </div>
                <div className="flex flex-col items-center gap-1.5 rounded-xl border border-[#e8edf5] bg-[#f8faff] px-4 py-4 text-center">
                  <span className="text-xl">🗜️</span>
                  <span className="text-xs font-semibold text-slate-700">Compress</span>
                  <span className="text-[11px] text-slate-400 leading-snug">Reduce file size by up to 80% for easy sharing</span>
                </div>
              </div>

              {/* ── Trust pills ── */}
              <div className="flex items-center gap-4 mb-8">
                <span className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Files up to 150 MB
                </span>
                <span className="text-slate-200">|</span>
                <span className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Deleted after processing
                </span>
                <span className="text-slate-200">|</span>
                <span className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  No account needed
                </span>
              </div>

              {/* ── Ad slot ── */}
              <div className="w-full max-w-[740px]">
                <p className="text-[10px] text-slate-300 text-center mb-1 uppercase tracking-wide">Advertisement</p>
                <GoogleAdSlot
                  adSlot={import.meta.env.VITE_ADSENSE_SLOT_PREVIEW_EMPTY ?? ""}
                  className="grid w-full h-[96px] place-items-center rounded-xl border border-[#d5deeb] bg-[#eef2f7] text-[11px] text-[#a3aebb]"
                  fallbackLabel="Ad Space"
                />
              </div>

            </div>
          )}
        </div>
      </div>

      <div
        className="absolute right-3 bottom-3 z-10 flex items-center gap-2 rounded-lg bg-white/90 px-2 py-2 shadow-sm backdrop-blur-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <RippleButton
          type="button"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-300 bg-white text-sm font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={handleZoomOut}
          disabled={isPreviewDisabled || zoom <= 50}
          aria-label="Zoom out"
        >
          -
        </RippleButton>
        <div className="min-w-14 text-center text-xs font-semibold text-slate-700">
          {zoom}%
        </div>
        <RippleButton
          type="button"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-300 bg-white text-sm font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={handleZoomIn}
          disabled={isPreviewDisabled || zoom >= 150}
          aria-label="Zoom in"
        >
          +
        </RippleButton>
        <RippleButton
          type="button"
          className="inline-flex h-8 items-center justify-center rounded-md border border-slate-300 bg-white px-2.5 text-xs font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={handleZoomReset}
          disabled={isPreviewDisabled || zoom === 100}
        >
          Reset
        </RippleButton>
      </div>
    </main>
  );
}
