import { pdfjs } from "react-pdf";

export const pdfDocumentOptions = {
  standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/standard_fonts/`,
};

const safeBytesCopy = (bytes: Uint8Array) => {
  try {
    return bytes.slice();
  } catch (error) {
    console.error("safeBytesCopy failed", error);
    return new Uint8Array();
  }
};

export async function extractPageText(
  bytes: Uint8Array,
  pageIndex: number,
): Promise<string> {
  const task = pdfjs.getDocument({ data: safeBytesCopy(bytes) });

  try {
    const pdf = await task.promise;
    const page = await pdf.getPage(pageIndex + 1);
    const content = await page.getTextContent();

    const textItems = content.items
      .map((item) => {
        if (!("str" in item)) {
          return null;
        }

        const value = item.str?.trim();
        if (!value) {
          return null;
        }

        const transform = "transform" in item ? item.transform : null;
        const x = Array.isArray(transform) ? Number(transform[4] ?? 0) : 0;
        const y = Array.isArray(transform) ? Number(transform[5] ?? 0) : 0;

        return { value, x, y };
      })
      .filter(
        (
          entry,
        ): entry is {
          value: string;
          x: number;
          y: number;
        } => !!entry,
      )
      .sort((left, right) => {
        if (Math.abs(right.y - left.y) > 2) {
          return right.y - left.y;
        }

        return left.x - right.x;
      });

    const lines: Array<{
      y: number;
      parts: Array<{ value: string; x: number }>;
    }> = [];

    for (const item of textItems) {
      const currentLine = lines.at(-1);
      if (!currentLine || Math.abs(currentLine.y - item.y) > 4) {
        lines.push({
          y: item.y,
          parts: [{ value: item.value, x: item.x }],
        });
        continue;
      }

      currentLine.parts.push({ value: item.value, x: item.x });
    }

    const lineText = lines
      .map((line) =>
        [...line.parts]
          .sort((left, right) => left.x - right.x)
          .map((part) => part.value)
          .join(" ")
          .replace(/\s+/g, " ")
          .trim(),
      )
      .filter((line) => line.length > 0)
      .join("\n");

    pdf.cleanup();
    await pdf.destroy();

    return lineText;
  } finally {
    task.destroy();
  }
}
