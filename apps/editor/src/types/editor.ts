export type EditorTab = "edit" | "marge" | "compress";
export type ToolKind = "edit" | "highlight" | "signature" | "image";

export interface HtmlPage {
  name: string;
  html: string;
}

export interface PdfFileItem {
  id: string;
  name: string;
  sourceType: "pdf" | "image";
  size: number;
  bytes: Uint8Array;
  previewImageDataUrl?: string;
  pageCount: number;
  pageOrder: number[];
  htmlPages?: HtmlPage[];
}

export interface CombinedPageRef {
  id: string;
  docId: string;
  sourcePage: number;
}

export interface OverlayItem {
  id: string;
  docId: string;
  type: ToolKind;
  pageIndex: number;
  pageId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  imageDataUrl?: string;
  highlightColor?: string;
}

export type OverlayPatch = Partial<
  Pick<
    OverlayItem,
    "x" | "y" | "width" | "height" | "imageDataUrl" | "highlightColor"
  >
>;

export interface ExportResult {
  fileName: string;
  mimeType: string;
  bytes: Uint8Array;
  pageCount: number;
}
