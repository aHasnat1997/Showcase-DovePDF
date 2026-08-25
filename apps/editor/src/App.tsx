import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { ExportModal } from "./components/ExportModal";
import { LeftSidebar } from "./components/LeftSidebar";
import { TopBar } from "./components/TopBar";
import { applyPdfOverlays, getPdfPageCount } from "./lib/pdf";
import { useEditorStore } from "./store/editorStore";
import type { ExportResult } from "./types/editor";
import { RightPanel } from "./components/RightPanel";
import { PreviewPane } from "./components/PreviewPane";
import { usePdfExport } from "./hooks/usePdfExport";
import { useUndoRedo } from "./hooks/useUndoRedo";
import { applyOverlaysToHtml } from "./utils/applyOverlaysToHtml";
import { buildHtmlDoc } from "./utils/buildHtmlDoc";
import { wrapHtmlForPdfExport } from "./utils/wrapHtmlForPdfExport";

const safeBytesCopy = (bytes: Uint8Array) => {
  try {
    return bytes.slice();
  } catch (error) {
    console.error("safeBytesCopy failed", error);
    return new Uint8Array();
  }
};

const stripExtension = (name: string) => name.replace(/\.[^./\\]+$/, "");

const SIGNATURE_LIMIT_BYTES = 5 * 1024 * 1024;
const IMAGE_LIMIT_BYTES = 10 * 1024 * 1024;
const PDF_MIME_TYPE = "application/pdf";
const fileSignature = (name: string, size: number) => `${name}:${size}`;
const isPdfFile = (file: File) =>
  file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

export default function App() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const signatureInputRef = useRef<HTMLInputElement>(null);
  const contentImageInputRef = useRef<HTMLInputElement>(null);

  const [exportResult, setExportResult] = useState<ExportResult | null>(null);
  const [requestedPageId, setRequestedPageId] = useState<string | null>(null);
  const [signatureImage, setSignatureImage] = useState<string | null>(null);
  const [editorImage, setEditorImage] = useState<string | null>(null);
  const [currentHighlightColor, setCurrentHighlightColor] =
    useState<string>("#22c55e76");

  const {
    documents,
    combinedPages,
    exportFileName,
    activeDocumentId,
    selectedPage,
    activeTab,
    activeTool,
    overlays,
    isBusy,
    isExportOpen,
    pageSizes,
    addPdfFiles,
    removeDocument,
    setActiveDocument,
    setActiveFromCombinedPage,
    setActiveTab,
    setActiveTool,
    setDocumentHtmlPages,
    setIsBusy,
    setIsExportOpen,
    compressionLevel,
    setCompressionLevel,
    setExportFileName,
    clearWorkspace,
  } = useEditorStore();

  const { canUndo, canRedo, undo, redo, pushHistory } = useUndoRedo(overlays);

  const { exportPdfToHtml, exportHtmlToPdf } = usePdfExport();

  const activeDocument = useMemo(
    () => documents.find((item) => item.id === activeDocumentId) ?? null,
    [documents, activeDocumentId],
  );
  const hasDocuments = documents.length > 0;

  const fileDataByDocId = useMemo(() => {
    return documents.reduce<Record<string, Uint8Array>>((result, doc) => {
      result[doc.id] = doc.bytes;
      return result;
    }, {});
  }, [documents]);

  const activePageId = useMemo(() => {
    if (!activeDocument) {
      return null;
    }

    const sourcePage = activeDocument.pageOrder[selectedPage];
    if (sourcePage === undefined) {
      return null;
    }

    return `${activeDocument.id}:${sourcePage}`;
  }, [activeDocument, selectedPage]);

  const fallbackFileName = useMemo(() => {
    if (documents.length === 0) {
      return "";
    }
    return stripExtension(documents[0]?.name ?? "document");
  }, [documents]);

  const topBarFileName =
    exportFileName.trim().length > 0 ? exportFileName : null;
  const isWorkspaceEmpty = !hasDocuments;

  useEffect(() => {
    if (documents.length > 0 && exportFileName.trim().length === 0) {
      setExportFileName(fallbackFileName);
    }
  }, [documents.length, exportFileName, fallbackFileName, setExportFileName]);

  // Track overlay changes for undo/redo history
  const previousOverlaysRef = useRef(overlays);
  useEffect(() => {
    if (
      JSON.stringify(previousOverlaysRef.current) !== JSON.stringify(overlays)
    ) {
      pushHistory(overlays);
      previousOverlaysRef.current = overlays;
    }
  }, [overlays, pushHistory]);

  // Add keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isWorkspaceEmpty || isBusy) return;

      if (
        (event.ctrlKey || event.metaKey) &&
        event.key === "z" &&
        !event.shiftKey
      ) {
        event.preventDefault();
        const previousOverlays = undo();
        if (previousOverlays) {
          useEditorStore.setState({ overlays: previousOverlays });
        }
      } else if (
        (event.ctrlKey || event.metaKey) &&
        (event.key === "z" || event.key === "y") &&
        event.shiftKey
      ) {
        event.preventDefault();
        const nextOverlays = redo();
        if (nextOverlays) {
          useEditorStore.setState({ overlays: nextOverlays });
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo, isWorkspaceEmpty, isBusy]);

  const handleUndo = useCallback(() => {
    const previousOverlays = undo();
    if (previousOverlays) {
      useEditorStore.setState({ overlays: previousOverlays });
    }
  }, [undo]);

  const handleRedo = useCallback(() => {
    const nextOverlays = redo();
    if (nextOverlays) {
      useEditorStore.setState({ overlays: nextOverlays });
    }
  }, [redo]);

  const handleOpenFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handlePdfFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);

    if (files.length > 0) {
      setIsBusy(true);

      try {
        const htmlPagesByFile = new Map<
          string,
          { name: string; html: string }[]
        >();

        for (const file of files) {
          if (!isPdfFile(file)) {
            continue;
          }

          try {
            const pages = await exportPdfToHtml(file);
            if (pages.length > 0) {
              htmlPagesByFile.set(fileSignature(file.name, file.size), pages);
            }
          } catch (error) {
            console.error("PDF to HTML export failed:", error);
          }
        }

        const loaded = await addPdfFiles(files);

        for (const doc of loaded) {
          if (doc.sourceType !== "pdf") {
            continue;
          }

          const pages = htmlPagesByFile.get(fileSignature(doc.name, doc.size));
          if (pages && pages.length > 0) {
            setDocumentHtmlPages(doc.id, pages);
          }
        }
      } finally {
        setIsBusy(false);
      }
    }

    if (!activeDocumentId && files.length > 0) {
      const firstDocument = useEditorStore.getState().documents[0];
      if (firstDocument) {
        setActiveDocument(firstDocument.id);
      }
    }

    event.target.value = "";
  };

  const handleHighlightColor = (color: string) => {
    setCurrentHighlightColor(color);
  };

  const handlePickSignature = () => {
    signatureInputRef.current?.click();
  };

  const handlePickContentImage = () => {
    contentImageInputRef.current?.click();
  };

  const handleSignatureFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (file.size > SIGNATURE_LIMIT_BYTES) {
      window.alert("Signature image must be 5MB or less.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const imageUrl = typeof reader.result === "string" ? reader.result : null;
      setSignatureImage(imageUrl);
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const handleContentImageFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (file.size > IMAGE_LIMIT_BYTES) {
      window.alert("Image must be 10MB or less.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const imageUrl = typeof reader.result === "string" ? reader.result : null;
      setEditorImage(imageUrl);
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const buildExportBytes = async (): Promise<ExportResult | null> => {
    if (documents.length === 0) {
      return null;
    }

    const source = activeDocument ?? documents[0];
    const chosenName =
      exportFileName || stripExtension(source?.name ?? "document");
    const safeName = chosenName.trim() || "document";
    const exportName = safeName.toLowerCase().endsWith(".pdf")
      ? safeName
      : `${safeName}.pdf`;

    let bytes: Uint8Array = safeBytesCopy(source.bytes);
    bytes = await applyPdfOverlays(bytes, overlays, combinedPages);
    const pageCount = await getPdfPageCount(bytes);

    return {
      fileName: exportName,
      mimeType: PDF_MIME_TYPE,
      bytes,
      pageCount,
    };
  };

  const handlePrepareExport = async () => {
    setIsBusy(true);
    try {
      const result = await buildExportBytes();

      if (!result) {
        window.alert("Upload at least one file before export.");
        return;
      }

      setExportResult(result);
      setIsExportOpen(true);
    } catch (error) {
      console.error("Export failed:", error);
      window.alert(
        `Export failed: ${error instanceof Error ? error.message : "Unknown error"}. Check console for details.`,
      );
    } finally {
      setIsBusy(false);
    }
  };

  const handleDownload = async () => {
    if (!exportResult) {
      return;
    }

    setIsBusy(true);

    try {
      // Check if user made HTML edits (pages have HTML content)
      const hasHtmlEdits = combinedPages.some((pageRef) => {
        const doc = documents.find((d) => d.id === pageRef.docId);
        return (
          doc?.sourceType === "pdf" && doc.htmlPages?.[pageRef.sourcePage]?.html
        );
      });

      // If HTML edits exist, export via HTML→PDF to show changes
      if (hasHtmlEdits) {
        const htmlPagesForExport: string[] = [];
        const exportPageIds: string[] = [];

        for (const pageRef of combinedPages) {
          const doc = documents.find((d) => d.id === pageRef.docId);
          if (!doc || doc.sourceType !== "pdf") continue;

          const htmlPage = doc.htmlPages?.[pageRef.sourcePage];
          if (!htmlPage?.html) continue;

          const naturalSize = pageSizes[pageRef.id];
          const previewHtml = buildHtmlDoc(htmlPage.html);

          const htmlWithOverlays = applyOverlaysToHtml(
            previewHtml,
            overlays,
            pageRef.id,
            naturalSize?.width,
            naturalSize?.height,
          );

          htmlPagesForExport.push(htmlWithOverlays);
          exportPageIds.push(pageRef.id);
        }

        if (htmlPagesForExport.length > 0) {
          const exportHtml = wrapHtmlForPdfExport(
            htmlPagesForExport,
            pageSizes,
            exportPageIds,
          );

          const finalBlob = await exportHtmlToPdf(
            exportHtml,
            exportResult.fileName,
            compressionLevel,
          );

          const url = URL.createObjectURL(finalBlob);
          const link = document.createElement("a");
          link.href = url;
          link.download = exportResult.fileName;
          document.body.append(link);
          link.click();
          link.remove();
          URL.revokeObjectURL(url);

          setRequestedPageId(null);
          setSignatureImage(null);
          setEditorImage(null);
          setExportResult(null);
          setIsExportOpen(false);
          clearWorkspace();
          return;
        }
      }

      // No HTML edits: use original PDF with overlays applied
      // This preserves original colors/styling perfectly
      const blob = new Blob([safeBytesCopy(exportResult.bytes)], {
        type: exportResult.mimeType,
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = exportResult.fileName;
      document.body.append(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      setRequestedPageId(null);
      setSignatureImage(null);
      setEditorImage(null);
      setExportResult(null);
      setIsExportOpen(false);
      clearWorkspace();
    } catch (error) {
      console.error("Download failed:", error);
      window.alert(
        `Download failed: ${error instanceof Error ? error.message : "Unknown error"}\nCheck browser console logs.`,
      );
    } finally {
      setIsBusy(false);
    }
  };

  const handleRemovePage = useCallback(
    (pageId: string) => {
      const page = combinedPages.find((p) => p.id === pageId);
      if (!page) return;

      const doc = documents.find((d) => d.id === page.docId);
      if (!doc) return;

      if (doc.pageCount === 1) {
        removeDocument(page.docId);
      } else {
        const updatedPages = combinedPages.filter((p) => p.id !== pageId);
        useEditorStore.setState({ combinedPages: updatedPages });

        const updatedOverlays = overlays.filter((o) => o.pageId !== pageId);
        useEditorStore.setState({ overlays: updatedOverlays });
      }
    },
    [combinedPages, documents, removeDocument, overlays],
  );

  return (
    <div className="min-h-screen bg-[#232428] text-slate-900">
      {isBusy ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="loader"></div>
        </div>
      ) : null}
      <div className="grid min-h-[calc(100vh-16px)] w-full grid-rows-[52px_1fr] border border-[#3a3d45] bg-[#f4f5f8]">
        <TopBar
          fileName={topBarFileName}
          onFileNameChange={(value) => {
            const nextName = stripExtension(value).trim();
            if (nextName.length === 0) {
              return;
            }
            setExportFileName(nextName);
          }}
          onClear={clearWorkspace}
          onExport={handlePrepareExport}
          disabled={isBusy || isWorkspaceEmpty}
          onAddFiles={handleOpenFilePicker}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={canUndo}
          canRedo={canRedo}
        />

        <div className="grid min-h-0 grid-cols-[200px_1fr_380px] max-[1280px]:grid-cols-[150px_1fr_250px]">
          <LeftSidebar
            documents={documents}
            combinedPages={combinedPages}
            activePageId={activePageId}
            fileDataByDocId={fileDataByDocId}
            onSelectPage={(pageId) => {
              setActiveFromCombinedPage(pageId);
              setRequestedPageId(pageId);
            }}
            onRemovePage={handleRemovePage}
            onReorderPages={useEditorStore.getState().reorderPages}
          />

          <PreviewPane
            documents={documents}
            combinedPages={combinedPages}
            activePageId={activePageId}
            requestedPageId={requestedPageId}
            onActivatePage={setActiveFromCombinedPage}
            onScrollHandled={() => setRequestedPageId(null)}
            activeTool={activeTool}
            currentHighlightColor={currentHighlightColor}
            signatureImage={signatureImage}
            editorImage={editorImage}
            disabled={isWorkspaceEmpty}
            onAddFiles={handleOpenFilePicker}
          />

          <RightPanel
            activeTab={activeTab}
            activeTool={activeTool}
            documents={documents}
            disabled={isWorkspaceEmpty}
            signatureImage={signatureImage}
            editorImage={editorImage}
            currentHighlightColor={currentHighlightColor}
            compressionLevel={compressionLevel}
            onTabChange={setActiveTab}
            onToolChange={setActiveTool}
            onHighlightColor={handleHighlightColor}
            onPickSignature={handlePickSignature}
            onPickEditorImage={handlePickContentImage}
            onCompressionChange={setCompressionLevel}
          />
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.webp,.gif,.bmp,application/pdf,image/*"
          multiple
          hidden
          onChange={handlePdfFiles}
        />

        <input
          ref={signatureInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          hidden
          onChange={handleSignatureFile}
        />

        <input
          ref={contentImageInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          hidden
          onChange={handleContentImageFile}
        />

        <ExportModal
          open={isExportOpen && !!exportResult}
          fileName={exportResult?.fileName ?? "document.pdf"}
          pageCount={exportResult?.pageCount ?? 0}
          fileSize={exportResult?.bytes.byteLength ?? 0}
          onClose={() => setIsExportOpen(false)}
          onDownload={handleDownload}
        />
      </div>
    </div>
  );
}
