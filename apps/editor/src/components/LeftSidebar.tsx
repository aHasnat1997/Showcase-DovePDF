import { useEffect, useRef, useState } from "react";
import { GripVertical, Trash2 } from "lucide-react";
import { Document, Page } from "react-pdf";
import { pdfDocumentOptions } from "../lib/pdfjs";
import { RippleButton } from "./ui/RippleButton";
import { PdfErrorBoundary } from "./PdfErrorBoundary";
import type { CombinedPageRef, PdfFileItem } from "../types/editor";

interface SidebarPagePreviewProps {
  fileUrl: string;
  pageNumber: number;
  pageIdentity: string;
}

function SidebarPagePreview({
  fileUrl,
  pageNumber,
  pageIdentity,
}: SidebarPagePreviewProps) {
  return (
    <Document
      key={pageIdentity}
      file={fileUrl}
      options={pdfDocumentOptions}
      error={
        <div className="p-2.5 text-[10px] text-rose-500">
          Preview unavailable
        </div>
      }
      loading={<div className="p-2.5 text-xs text-slate-500">Loading…</div>}
    >
      <Page
        pageNumber={pageNumber}
        width={160}
        renderTextLayer={false}
        renderAnnotationLayer={false}
        className="overflow-hidden rounded-md"
      />
    </Document>
  );
}

function SidebarImagePreview({ src, alt }: { src: string; alt: string }) {
  return (
    <img
      src={src}
      alt={alt}
      className="block w-full overflow-hidden rounded-md object-cover"
      style={{ height: 226 }}
    />
  );
}

interface LeftSidebarProps {
  documents: PdfFileItem[];
  combinedPages: CombinedPageRef[];
  activePageId: string | null;
  fileDataByDocId: Record<string, Uint8Array>;
  onSelectPage: (pageId: string) => void;
  onRemovePage: (pageId: string) => void;
  onReorderPages: (fromIndex: number, toIndex: number) => void;
}

export function LeftSidebar({
  documents,
  combinedPages,
  activePageId,
  fileDataByDocId,
  onSelectPage,
  onRemovePage,
  onReorderPages,
}: LeftSidebarProps) {
  const pageRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const pdfBlobCacheRef = useRef<
    Record<string, { url: string; bytes: Uint8Array }>
  >({});
  const [pdfBlobUrlByDocId, setPdfBlobUrlByDocId] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      const map: Record<string, string> = {};
      const cache = pdfBlobCacheRef.current;

      for (const doc of documents) {
        if (doc.sourceType !== "pdf" || doc.bytes.length === 0) {
          continue;
        }

        const cached = cache[doc.id];
        if (cached && cached.bytes === doc.bytes) {
          map[doc.id] = cached.url;
          continue;
        }

        const blob = new Blob([new Uint8Array(doc.bytes)], {
          type: "application/pdf",
        });
        const url = URL.createObjectURL(blob);
        if (cached) {
          URL.revokeObjectURL(cached.url);
        }
        cache[doc.id] = { url, bytes: doc.bytes };
        map[doc.id] = url;
      }

      for (const [docId, cached] of Object.entries(cache)) {
        if (!map[docId]) {
          URL.revokeObjectURL(cached.url);
          delete cache[docId];
        }
      }

      setPdfBlobUrlByDocId(map);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [documents]);

  useEffect(() => {
    return () => {
      const cache = pdfBlobCacheRef.current;
      for (const cached of Object.values(cache)) {
        URL.revokeObjectURL(cached.url);
      }
      pdfBlobCacheRef.current = {};
    };
  }, []);

  const activeCount = combinedPages.length;

  useEffect(() => {
    if (!activePageId) {
      return;
    }

    pageRefs.current[activePageId]?.scrollIntoView({
      block: "nearest",
      behavior: "smooth",
    });
  }, [activePageId]);

  return (
    <aside className="flex flex-col border-r border-[#e4e8f0] bg-[#f2f4f7]">
      <div className="mt-[14px] px-3 text-xs font-bold text-slate-900">
        Document Pages
      </div>
      <div className="mt-0.5 px-3 text-[11px] text-slate-500">
        {activeCount} pages
      </div>

      <div className="h-[89dvh] overflow-auto no-scrollbar p-2 space-y-2">
        {combinedPages.length > 0 ? (
          combinedPages.map((page, index) => {
            const fileData = fileDataByDocId[page.docId];
            const fileUrl = pdfBlobUrlByDocId[page.docId];
            const doc = documents.find((item) => item.id === page.docId);

            if (!doc) {
              return null;
            }

            return (
              <div
                key={page.id}
                ref={(element) => {
                  pageRefs.current[page.id] = element;
                }}
                draggable
                onDragStart={() => setDraggedIndex(index)}
                onDragEnd={() => {
                  setDraggedIndex(null);
                  setDragOverIndex(null);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverIndex(index);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  if (draggedIndex !== null && draggedIndex !== index) {
                    onReorderPages(draggedIndex, index);
                  }
                  setDraggedIndex(null);
                  setDragOverIndex(null);
                }}
                className={`relative w-full cursor-pointer rounded-lg border bg-white p-1 text-left ${
                  activePageId === page.id
                    ? "border-[#377dff] ring-2 ring-[#377dff]/10"
                    : "border-[#dfe5ee]"
                } ${
                  dragOverIndex === index && draggedIndex !== index
                    ? "border-t-4 border-t-blue-500"
                    : ""
                }`}
                onClick={() => onSelectPage(page.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelectPage(page.id);
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <div className="absolute top-1.5 right-1.5 z-[2] flex gap-1">
                  <div className="grid h-[18px] w-[18px] place-items-center rounded-[5px] border border-[#d5deeb] bg-white text-slate-700">
                    <GripVertical size={12} />
                  </div>
                  <RippleButton
                    type="button"
                    className="grid h-[18px] w-[18px] place-items-center rounded-[5px] border border-[#d5deeb] bg-white text-slate-700"
                    onClick={(event) => {
                      event.stopPropagation();
                      onRemovePage(page.id);
                    }}
                  >
                    <Trash2 size={11} />
                  </RippleButton>
                </div>

                {doc.sourceType === "image" && doc.previewImageDataUrl ? (
                  <SidebarImagePreview
                    src={doc.previewImageDataUrl}
                    alt={doc.name}
                  />
                ) : fileUrl ? (
                  <PdfErrorBoundary
                    pageWidth={160}
                    pageHeight={226}
                    resetKey={`${page.id}:${index}:${fileData.length}`}
                  >
                    <SidebarPagePreview
                      fileUrl={fileUrl}
                      pageNumber={page.sourcePage + 1}
                      pageIdentity={`${page.id}:${index}`}
                    />
                  </PdfErrorBoundary>
                ) : (
                  <div className="p-2.5 text-[10px] text-rose-500">
                    Preview unavailable
                  </div>
                )}
                <span className="mt-0.5 block text-center text-[10px] text-slate-500">
                  Page {index + 1}
                </span>
              </div>
            );
          })
        ) : (
          <div className="w-full p-2.5 text-xs text-slate-400 border border-dashed border-[#d5ddeb] rounded-lg text-center py-25">
            No file selected.
          </div>
        )}
      </div>
    </aside>
  );
}
