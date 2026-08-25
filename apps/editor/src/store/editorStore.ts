import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PersistStorage, StorageValue } from "zustand/middleware";
import { PDFDocument } from "pdf-lib";
import { getPdfPageCount } from "../lib/pdf";
import type {
  CombinedPageRef,
  EditorTab,
  HtmlPage,
  OverlayPatch,
  OverlayItem,
  PdfFileItem,
  ToolKind,
} from "../types/editor";

interface EditorState {
  documents: PdfFileItem[];
  combinedPages: CombinedPageRef[];
  exportFileName: string;
  activeDocumentId: string | null;
  selectedPage: number;
  activeTab: EditorTab;
  activeTool: ToolKind | null;
  overlays: OverlayItem[];
  isBusy: boolean;
  isExportOpen: boolean;
  previewZoom: number;
  compressionLevel: number;
  // ─── NEW: stores the natural (unscaled) content size of each page ───────────
  // Key is pageId (e.g. "docId:sourcePage"), value is { width, height } in px.
  pageSizes: Record<string, { width: number; height: number }>;
  addPdfFiles: (files: File[]) => Promise<PdfFileItem[]>;
  removeDocument: (id: string) => void;
  setActiveDocument: (id: string) => void;
  setSelectedPage: (page: number) => void;
  setActiveFromCombinedPage: (pageId: string) => void;
  reorderPages: (fromIndex: number, toIndex: number) => void;
  updateOverlayPageId: (oldPageId: string, newPageId: string) => void;
  setActiveTab: (tab: EditorTab) => void;
  setActiveTool: (tool: ToolKind | null) => void;
  setDocumentHtmlPages: (docId: string, pages: HtmlPage[] | null) => void;
  addOverlay: (overlay: OverlayItem) => void;
  updateOverlay: (id: string, patch: OverlayPatch) => void;
  removeOverlay: (id: string) => void;
  setIsBusy: (busy: boolean) => void;
  setIsExportOpen: (open: boolean) => void;
  setPreviewZoom: (zoom: number) => void;
  setCompressionLevel: (level: number) => void;
  setExportFileName: (name: string) => void;
  // ─── NEW action ─────────────────────────────────────────────────────────────
  setPageSize: (
    pageId: string,
    size: { width: number; height: number },
  ) => void;
  clearWorkspace: () => void;
}

const uid = () => Math.random().toString(36).slice(2, 11);

const defaultState = {
  documents: [] as PdfFileItem[],
  combinedPages: [] as CombinedPageRef[],
  exportFileName: "",
  activeDocumentId: null as string | null,
  selectedPage: 0,
  activeTab: "edit" as EditorTab,
  activeTool: null as ToolKind | null,
  overlays: [] as OverlayItem[],
  isBusy: false,
  isExportOpen: false,
  previewZoom: 100,
  compressionLevel: 0,
  // ─── NEW ────────────────────────────────────────────────────────────────────
  pageSizes: {} as Record<string, { width: number; height: number }>,
};

const bytesToBase64 = (bytes: Uint8Array) => {
  let binary = "";
  const chunkSize = 0x8000;

  for (let index = 0; index < bytes.length; index += chunkSize) {
    const chunk = bytes.subarray(index, index + chunkSize);
    binary += String.fromCharCode(...chunk);
  }

  return btoa(binary);
};

const base64ToBytes = (value: string) => {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
};

const STORAGE_NAME = "pdf-viewer-cache-v1";
const DB_NAME = "pdf-viewer-db";
const DB_STORE_NAME = "zustand-store";

const openPersistDb = () =>
  new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(DB_STORE_NAME)) {
        db.createObjectStore(DB_STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

const idbGet = async (key: string) => {
  const db = await openPersistDb();

  return new Promise<string | null>((resolve, reject) => {
    const transaction = db.transaction(DB_STORE_NAME, "readonly");
    const store = transaction.objectStore(DB_STORE_NAME);
    const request = store.get(key);

    request.onsuccess = () =>
      resolve((request.result as string | undefined) ?? null);
    request.onerror = () => reject(request.error);
  });
};

const idbSet = async (key: string, value: string) => {
  const db = await openPersistDb();

  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(DB_STORE_NAME, "readwrite");
    const store = transaction.objectStore(DB_STORE_NAME);
    store.put(value, key);

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
};

const idbRemove = async (key: string) => {
  const db = await openPersistDb();

  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(DB_STORE_NAME, "readwrite");
    const store = transaction.objectStore(DB_STORE_NAME);
    store.delete(key);

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
};

const indexedDbStorage: PersistStorage<unknown> = {
  getItem: async (name) => {
    const value = await idbGet(name);

    if (!value) {
      return null;
    }

    const parsed = JSON.parse(value, (_key, parsedValue) => {
      if (parsedValue && typeof parsedValue === "object") {
        const typedValue = parsedValue as {
          __type?: unknown;
          base64?: unknown;
        };

        if (
          typedValue.__type === "Uint8Array" &&
          typeof typedValue.base64 === "string"
        ) {
          return base64ToBytes(typedValue.base64);
        }
      }

      return parsedValue;
    }) as StorageValue<unknown>;

    // Migrate overlays to include pageId if missing
    if (parsed && typeof parsed === "object" && "state" in parsed) {
      const state = parsed.state as Record<string, unknown>;
      if (state.overlays && Array.isArray(state.overlays)) {
        state.overlays = state.overlays.map((overlay: OverlayItem) => {
          if (
            !overlay.pageId &&
            overlay.docId !== undefined &&
            overlay.pageIndex !== undefined
          ) {
            return {
              ...overlay,
              pageId: `${overlay.docId}:${overlay.pageIndex}`,
            };
          }
          return overlay;
        });
      }
    }

    return parsed;
  },
  setItem: async (name, value) => {
    const serialized = JSON.stringify(value, (_key, itemValue) => {
      if (itemValue instanceof Uint8Array) {
        return {
          __type: "Uint8Array",
          base64: bytesToBase64(itemValue),
        };
      }

      return itemValue;
    });

    await idbSet(name, serialized);
  },
  removeItem: async (name) => {
    await idbRemove(name);
  },
};

const getExt = (name: string) => name.split(".").pop()?.toLowerCase() ?? "";

const isPdfFile = (file: File) =>
  file.type === "application/pdf" || getExt(file.name) === "pdf";

const isImageFile = (file: File) => {
  const ext = getExt(file.name);
  return (
    file.type.startsWith("image/") ||
    ["png", "jpg", "jpeg", "webp", "gif", "bmp"].includes(ext)
  );
};

const imageFileToPngBytes = async (file: File): Promise<Uint8Array> => {
  if (file.type === "image/png") {
    return new Uint8Array(await file.arrayBuffer());
  }

  if (file.type === "image/jpeg" || file.type === "image/jpg") {
    const jpegDoc = await PDFDocument.create();
    const jpegBytes = new Uint8Array(await file.arrayBuffer());
    const jpg = await jpegDoc.embedJpg(jpegBytes);
    const page = jpegDoc.addPage([jpg.width, jpg.height]);
    page.drawImage(jpg, { x: 0, y: 0, width: jpg.width, height: jpg.height });
    return jpegDoc.save({ useObjectStreams: true });
  }

  const objectUrl = URL.createObjectURL(file);

  try {
    const imageElement = await new Promise<HTMLImageElement>(
      (resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error("Unsupported image format."));
        image.src = objectUrl;
      },
    );

    const canvas = document.createElement("canvas");
    canvas.width = imageElement.naturalWidth || imageElement.width;
    canvas.height = imageElement.naturalHeight || imageElement.height;

    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Unable to process image.");
    }

    context.drawImage(imageElement, 0, 0);
    const dataUrl = canvas.toDataURL("image/png");
    const base64 = dataUrl.split(",")[1] ?? "";
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);

    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }

    return bytes;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
};

const fileToDataUrl = async (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      resolve(result);
    };
    reader.onerror = () => reject(new Error("Unable to read image file."));
    reader.readAsDataURL(file);
  });

const buildImagePdf = async (file: File) => {
  const imageBuffer = new Uint8Array(await file.arrayBuffer());
  const doc = await PDFDocument.create();

  if (file.type === "image/jpeg" || file.type === "image/jpg") {
    const image = await doc.embedJpg(imageBuffer);
    const page = doc.addPage([image.width, image.height]);
    page.drawImage(image, {
      x: 0,
      y: 0,
      width: image.width,
      height: image.height,
    });
  } else {
    const pngBytes = await imageFileToPngBytes(file);
    const image = await doc.embedPng(pngBytes);
    const page = doc.addPage([image.width, image.height]);
    page.drawImage(image, {
      x: 0,
      y: 0,
      width: image.width,
      height: image.height,
    });
  }

  const bytes = await doc.save({ useObjectStreams: true });
  const pageCount = doc.getPageCount();

  return {
    bytes,
    pageCount,
    sourceType: "image" as const,
  };
};

const buildPdfItemFromFile = async (
  file: File,
): Promise<PdfFileItem | null> => {
  if (isPdfFile(file)) {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const pageCount = await getPdfPageCount(bytes);

    return {
      id: uid(),
      name: file.name,
      sourceType: "pdf",
      size: file.size,
      bytes,
      pageCount,
      pageOrder: Array.from({ length: pageCount }, (_, index) => index),
    };
  }

  if (isImageFile(file)) {
    const imagePdf = await buildImagePdf(file);
    const previewImageDataUrl = await fileToDataUrl(file);

    return {
      id: uid(),
      name: file.name,
      sourceType: imagePdf.sourceType,
      size: file.size,
      bytes: imagePdf.bytes,
      previewImageDataUrl,
      pageCount: imagePdf.pageCount,
      pageOrder: Array.from(
        { length: imagePdf.pageCount },
        (_, index) => index,
      ),
    };
  }

  return null;
};

const pageRefId = (docId: string, sourcePage: number) =>
  `${docId}:${sourcePage}`;
const stripExtension = (name: string) => name.replace(/\.[^./\\]+$/, "");

const buildCombinedRefsForDocument = (doc: PdfFileItem): CombinedPageRef[] =>
  doc.pageOrder.map((sourcePage) => ({
    id: pageRefId(doc.id, sourcePage),
    docId: doc.id,
    sourcePage,
  }));

export const useEditorStore = create<EditorState>()(
  persist(
    (set) => ({
      ...defaultState,

      async addPdfFiles(files) {
        if (files.length === 0) {
          return [];
        }

        set({ isBusy: true });

        try {
          const loaded: PdfFileItem[] = [];

          for (const file of files) {
            const item = await buildPdfItemFromFile(file);
            if (item) {
              loaded.push(item);
            }
          }

          set((state) => {
            const documents = [...state.documents, ...loaded];
            const combinedPages = [
              ...state.combinedPages,
              ...loaded.flatMap((doc) => buildCombinedRefsForDocument(doc)),
            ];
            const activeDocumentId =
              state.activeDocumentId ?? loaded[0]?.id ?? null;
            const exportFileName =
              state.exportFileName.trim().length > 0 ||
              state.documents.length > 0
                ? state.exportFileName
                : stripExtension(loaded[0]?.name ?? "");

            return {
              documents,
              combinedPages,
              exportFileName,
              activeDocumentId,
              selectedPage: 0,
            };
          });

          return loaded;
        } finally {
          set({ isBusy: false });
        }
      },

      removeDocument(id) {
        set((state) => {
          const documents = state.documents.filter((doc) => doc.id !== id);
          const combinedPages = state.combinedPages.filter(
            (page) => page.docId !== id,
          );
          const overlays = state.overlays.filter((item) => item.docId !== id);
          const activeDocumentId =
            state.activeDocumentId === id
              ? documents[0]
                ? documents[0].id
                : null
              : state.activeDocumentId;

          // Clean up pageSizes for removed doc
          const pageSizes = { ...state.pageSizes };
          for (const key of Object.keys(pageSizes)) {
            if (key.startsWith(`${id}:`)) {
              delete pageSizes[key];
            }
          }

          return {
            documents,
            combinedPages,
            overlays,
            pageSizes,
            exportFileName: documents.length === 0 ? "" : state.exportFileName,
            activeDocumentId,
            selectedPage: 0,
          };
        });
      },

      setActiveDocument(id) {
        set({ activeDocumentId: id, selectedPage: 0 });
      },

      setSelectedPage(page) {
        set({ selectedPage: page });
      },

      setActiveFromCombinedPage(pageId) {
        set((state) => {
          const page = state.combinedPages.find((item) => item.id === pageId);
          if (!page) {
            return state;
          }

          const doc = state.documents.find((item) => item.id === page.docId);
          if (!doc) {
            return state;
          }

          const selectedPage = doc.pageOrder.indexOf(page.sourcePage);
          if (selectedPage < 0) {
            return state;
          }

          return {
            activeDocumentId: page.docId,
            selectedPage,
          };
        });
      },

      reorderPages(fromIndex, toIndex) {
        set((state) => {
          const pages = [...state.combinedPages];
          const [moved] = pages.splice(fromIndex, 1);
          pages.splice(toIndex, 0, moved);
          return { combinedPages: pages };
        });
      },

      updateOverlayPageId(oldPageId, newPageId) {
        set((state) => ({
          overlays: state.overlays.map((overlay) =>
            overlay.pageId === oldPageId
              ? { ...overlay, pageId: newPageId }
              : overlay,
          ),
        }));
      },

      setActiveTab(tab) {
        set({ activeTab: tab });
      },

      setActiveTool(tool) {
        set({ activeTool: tool });
      },

      setDocumentHtmlPages(docId, pages) {
        set((state) => ({
          documents: state.documents.map((doc) =>
            doc.id === docId ? { ...doc, htmlPages: pages ?? undefined } : doc,
          ),
        }));
      },

      addOverlay(overlay) {
        set((state) => {
          const overlayWithPageId = overlay.pageId
            ? overlay
            : { ...overlay, pageId: `${overlay.docId}:${overlay.pageIndex}` };
          return {
            overlays: [...state.overlays, overlayWithPageId],
          };
        });
      },

      updateOverlay(id, patch) {
        set((state) => ({
          overlays: state.overlays.map((item) =>
            item.id === id ? { ...item, ...patch } : item,
          ),
        }));
      },

      removeOverlay(id) {
        set((state) => ({
          overlays: state.overlays.filter((item) => item.id !== id),
        }));
      },

      setIsBusy(isBusy) {
        set({ isBusy });
      },

      setIsExportOpen(isExportOpen) {
        set({ isExportOpen });
      },

      setPreviewZoom(previewZoom) {
        const clamped = Math.max(50, Math.min(150, previewZoom));
        set({ previewZoom: clamped });
      },

      setCompressionLevel(level) {
        const clamped = Math.max(0, Math.min(9, Math.round(level)));
        set({ compressionLevel: clamped });
      },

      setExportFileName(name) {
        set({ exportFileName: name });
      },

      // ─── NEW: store the natural content size reported by HtmlPageFrame ─────
      setPageSize(pageId, size) {
        set((state) => {
          const existing = state.pageSizes[pageId];
          if (
            existing &&
            existing.width === size.width &&
            existing.height === size.height
          ) {
            return state; // no change, avoid re-render
          }
          return {
            pageSizes: { ...state.pageSizes, [pageId]: size },
          };
        });
      },

      clearWorkspace() {
        set({ ...defaultState });
      },
    }),
    {
      name: STORAGE_NAME,
      storage: indexedDbStorage,
      partialize: (state) => ({
        documents: state.documents,
        combinedPages: state.combinedPages,
        exportFileName: state.exportFileName,
        activeDocumentId: state.activeDocumentId,
        selectedPage: state.selectedPage,
        activeTab: state.activeTab,
        activeTool: state.activeTool,
        overlays: state.overlays,
        previewZoom: state.previewZoom,
        compressionLevel: state.compressionLevel,
        // pageSizes is intentionally NOT persisted — it is rebuilt from the
        // live iframes each session, so stale sizes never corrupt exports.
      }),
    },
  ),
);
