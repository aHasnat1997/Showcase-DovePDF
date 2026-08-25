declare module "pdf2html" {
  export interface ProcessingOptions {
    maxBuffer?: number;
  }

  export interface PageOptions extends ProcessingOptions {
    text?: boolean;
  }

  export interface ThumbnailOptions extends ProcessingOptions {
    page?: number;
    imageType?: "png" | "jpg";
    width?: number;
    height?: number;
  }

  export interface PDFMetadata {
    title?: string;
    author?: string;
    subject?: string;
    pages: number;
    [key: string]: any;
  }

  export function html(
    input: string | Buffer,
    options?: ProcessingOptions,
  ): Promise<string>;
  export function text(
    input: string | Buffer,
    options?: ProcessingOptions,
  ): Promise<string>;
  export function pages(
    input: string | Buffer,
    options?: PageOptions,
  ): Promise<string[]>;
  export function meta(
    input: string | Buffer,
    options?: ProcessingOptions,
  ): Promise<PDFMetadata>;
  export function thumbnail(
    input: string | Buffer,
    options?: ThumbnailOptions,
  ): Promise<string>;
  export function extractImages(
    input: string | Buffer,
    options?: ProcessingOptions,
  ): Promise<string[]>;
}
