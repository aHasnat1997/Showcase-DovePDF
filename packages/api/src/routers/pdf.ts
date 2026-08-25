import { publicProcedure, router } from "../index";
import { z } from "zod";
import fs from "fs/promises";
import path from "path";
import { html } from "pdf2html";

export const pdfRouter = router({
  convertPdf: publicProcedure
    .input(
      z.object({
        filePath: z.string().describe("Absolute path to the uploaded PDF file"),
      }),
    )
    .mutation(async ({ input }) => {
      let htmlContent = "";

      try {
        // Convert PDF to HTML using pdf2html
        htmlContent = await html(input.filePath);
      } catch (error) {
        console.error("PDF conversion error:", error);
        throw new Error(
          `Failed to convert PDF: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      } finally {
        // Always clean up the uploaded PDF file
        try {
          await fs.unlink(input.filePath);
          console.log(`Deleted temporary PDF: ${input.filePath}`);
        } catch (unlinkError) {
          console.error(`Failed to delete PDF: ${unlinkError}`);
        }
      }

      return {
        success: true,
        htmlContent,
        fileName: path.basename(input.filePath, ".pdf"),
      };
    }),
});
