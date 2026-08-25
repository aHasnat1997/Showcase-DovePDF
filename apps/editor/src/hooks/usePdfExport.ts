import { useCallback } from "react";
import type { HtmlPage } from "../types/editor";

type PdfExportResponse = {
  success?: boolean;
  fileName?: string;
  pages?: HtmlPage[];
};

const getServerBaseUrl = () => {
  const rawUrl = import.meta.env.VITE_API_HOST;
  if (typeof rawUrl === "string" && rawUrl.trim().length > 0) {
    return rawUrl.replace(/\/+$/, "");
  }
  return "";
};

export function usePdfExport() {
  const exportPdfToHtml = useCallback(
    async (file: File): Promise<HtmlPage[]> => {
      const formData = new FormData();
      formData.append("pdf", file, file.name);

      const baseUrl = getServerBaseUrl();
      const response = await fetch(`${baseUrl}/api/pdf/export`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        const detail = errorText.trim().length > 0 ? ` - ${errorText}` : "";
        throw new Error(`PDF export failed with ${response.status}${detail}`);
      }

      const data = (await response.json()) as PdfExportResponse;
      if (!data || !Array.isArray(data.pages)) {
        throw new Error("Invalid response from PDF export.");
      }

      return data.pages.filter((page) => typeof page?.html === "string");
    },
    [],
  );

  const exportHtmlToPdf = useCallback(
    async (
      htmlContent: string,
      fileName: string,
      compressionLevel: number = 0,
    ): Promise<Blob> => {
      const baseUrl = getServerBaseUrl();
      const response = await fetch(`${baseUrl}/api/html/export-pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          htmlContent,
          fileName,
          compressionLevel,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        const detail = errorText.trim().length > 0 ? ` - ${errorText}` : "";
        throw new Error(
          `HTML to PDF export failed with ${response.status}${detail}`,
        );
      }

      return await response.blob();
    },
    [],
  );

  const compressPdf = useCallback(
    async (
      pdfBytes: Uint8Array,
      fileName: string,
      compressionLevel: number,
    ): Promise<Blob> => {
      const baseUrl = getServerBaseUrl();
      const formData = new FormData();
      const safeName =
        typeof fileName === "string" && fileName.trim().length > 0
          ? fileName.trim()
          : "document.pdf";
      const finalName = safeName.toLowerCase().endsWith(".pdf")
        ? safeName
        : `${safeName}.pdf`;

      formData.append(
        "pdf",
        new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" }),
        finalName,
      );
      formData.append("compressionLevel", `${compressionLevel}`);

      const response = await fetch(`${baseUrl}/api/pdf/compress`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        const detail = errorText.trim().length > 0 ? ` - ${errorText}` : "";
        throw new Error(
          `PDF compression failed with ${response.status}${detail}`,
        );
      }

      return await response.blob();
    },
    [],
  );

  return { exportPdfToHtml, exportHtmlToPdf, compressPdf };
}
