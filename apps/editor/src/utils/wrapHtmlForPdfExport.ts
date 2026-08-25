type ExportPageParts = {
  bodyHtml: string;
  bodyAttributes: string;
  headAssets: string[];
  width: number;
  height: number;
};

const PAGE_TARGET_SELECTOR =
  'div[id^="page-container"] > div, .pf, .page, #page-container';

const parsePx = (value: string | null | undefined): number => {
  if (!value) return 0;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
};

const getStylePx = (element: HTMLElement | null, property: string): number => {
  if (!element) return 0;
  return parsePx(element.style.getPropertyValue(property));
};

const scopeCssToPage = (css: string, pageScope: string): string => {
  const scopeSelector = `section[data-export-page="${pageScope}"]`;
  const cleanCss = css.replace(/<!--|-->/g, "");

  return cleanCss.replace(/(^|})\s*([^@{}][^{}]*)\{/g, (_match, prefix, selectors) => {
    const scopedSelectors = selectors
      .split(",")
      .map((selector: string) => selector.trim())
      .filter(Boolean)
      .map((selector: string) => {
        if (selector.startsWith(scopeSelector)) {
          return selector;
        }

        return `${scopeSelector} ${selector}`;
      })
      .join(", ");

    return `${prefix} ${scopedSelectors}{`;
  });
};

const getPageSize = (doc: Document): { width: number; height: number } => {
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

const extractPageParts = (
  html: string,
  pageScope: string,
  naturalWidth?: number,
  naturalHeight?: number,
): ExportPageParts => {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const headAssets: string[] = [];

    doc.head?.querySelectorAll("style").forEach((node) => {
      const css = node.textContent?.trim();
      if (css) {
        headAssets.push(`<style>${scopeCssToPage(css, pageScope)}</style>`);
      }
    });

    doc.head?.querySelectorAll('link[rel="stylesheet"]').forEach((node) => {
      const href = node.getAttribute("href");
      if (href) {
        headAssets.push(`<link rel="stylesheet" href="${href}">`);
      }
    });

    const body = doc.body;
    const bodyHtml = body?.innerHTML?.trim();

    // Use caller-supplied natural size if available, otherwise read from CSS.
    const docSize = getPageSize(doc);
    const pageWidth =
      naturalWidth && naturalWidth > 0 ? naturalWidth : docSize.width;
    const pageHeight =
      naturalHeight && naturalHeight > 0 ? naturalHeight : docSize.height;

    const bodyClass = body?.getAttribute("class") ?? "";
    const bodyStyle = body?.getAttribute("style") ?? "";
    const bodyAttrParts: string[] = [];

    if (body) {
      for (const attr of Array.from(body.attributes)) {
        if (attr.name === "class" || attr.name === "style") {
          continue;
        }

        if (attr.name === "contenteditable") {
          continue;
        }

        const value = attr.value.replace(/"/g, "&quot;");
        bodyAttrParts.push(`${attr.name}="${value}"`);
      }
    }

    const mergedClass = ["pdf-page", bodyClass].filter(Boolean).join(" ");

    // Fix: explicitly pin width AND height to the natural page size so the
    // export renderer never sees a larger content box than the page boundary.
    const mergedStyle = [
      bodyStyle,
      `width:${pageWidth}px`,
      `min-width:${pageWidth}px`,
      `max-width:${pageWidth}px`,
      `height:${pageHeight}px`,
      `min-height:${pageHeight}px`,
      `max-height:${pageHeight}px`,
      "margin:0",
      "padding:0",
      "overflow:hidden",
      "background:#fff",
      "position:relative",
    ]
      .filter(Boolean)
      .join(";");

    const bodyAttributes = [
      `class="${mergedClass}"`,
      `data-export-page="${pageScope}"`,
      ...bodyAttrParts,
    ].join(" ");

    return {
      bodyHtml: bodyHtml && bodyHtml.length > 0 ? bodyHtml : html,
      bodyAttributes: `${bodyAttributes} style="${mergedStyle.replace(/"/g, "&quot;")}"`,
      headAssets,
      width: pageWidth,
      height: pageHeight,
    };
  } catch (error) {
    console.warn("Failed to parse HTML page for export:", error);
    return {
      bodyHtml: html,
      bodyAttributes: `class="pdf-page" data-export-page="${pageScope}"`,
      headAssets: [],
      width: naturalWidth ?? 820,
      height: naturalHeight ?? Math.round(820 * Math.sqrt(2)),
    };
  }
};

/**
 * Wraps an array of per-page HTML strings into a single printable HTML document.
 *
 * @param htmlPages     - One HTML string per page (already has overlays baked in).
 * @param pageSizeMap   - Optional map of pageId → { width, height } for the
 *                        natural content size of each page, as reported by
 *                        HtmlPageFrame. When supplied the export dimensions
 *                        exactly match the preview coordinate space.
 * @param pageIds       - Optional array of pageIds in the same order as htmlPages,
 *                        used to look up sizes in pageSizeMap.
 */
export function wrapHtmlForPdfExport(
  htmlPages: string[],
  pageSizeMap?: Record<string, { width: number; height: number }>,
  pageIds?: string[],
): string {
  const headAssets = new Set<string>();

  const pageParts = htmlPages.map((pageHtml, index) => {
    const pageId = pageIds?.[index];
    const size = pageId ? pageSizeMap?.[pageId] : undefined;
    return extractPageParts(pageHtml, `page-${index}`, size?.width, size?.height);
  });

  const firstPage = pageParts[0] ?? {
    width: 820,
    height: Math.round(820 * Math.sqrt(2)),
  };

  const combinedContent = pageParts
    .map((parts) => {
      parts.headAssets.forEach((asset) => headAssets.add(asset));
      return `<section ${parts.bodyAttributes}>${parts.bodyHtml}</section>`;
    })
    .join("");

  const headMarkup = Array.from(headAssets).join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  ${headMarkup}
  <style>
    html, body {
      margin: 0;
      padding: 0;
      width: ${firstPage.width}px;
      background: #fff;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      color-adjust: exact;
    }
    @page {
      size: ${firstPage.width}px ${firstPage.height}px;
      margin: 0;
    }
    .pdf-page {
      position: relative;
      display: block;
      overflow: hidden;
      page-break-after: always;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      color-adjust: exact;
    }
    .pdf-page:last-child {
      page-break-after: auto;
    }
    /* Ensure inline styles are preserved with high priority */
    .pdf-page * {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      color-adjust: exact;
    }
    /* Explicitly preserve inline text-decoration */
    *[style*="text-decoration: underline"] {
      text-decoration: underline !important;
    }
    *[style*="text-decoration:underline"] {
      text-decoration: underline !important;
    }
    *[style*="text-decoration: line-through"] {
      text-decoration: line-through !important;
    }
    *[style*="text-decoration:line-through"] {
      text-decoration: line-through !important;
    }
    @media print {
      html, body {
        margin: 0;
        padding: 0;
      }
      *[style*="text-decoration: underline"] {
        text-decoration: underline !important;
      }
      *[style*="text-decoration:underline"] {
        text-decoration: underline !important;
      }
      *[style*="text-decoration: line-through"] {
        text-decoration: line-through !important;
      }
      *[style*="text-decoration:line-through"] {
        text-decoration: line-through !important;
      }
    }
  </style>
  <script>
    (function() {
      if (typeof document !== 'undefined') {
        var fontsLoaded = false;
        var imagesLoaded = false;

        function checkReady() {
          if (fontsLoaded && imagesLoaded) {
            document.body.setAttribute('data-render-ready', 'true');
          }
        }

        if (document.fonts && document.fonts.ready) {
          document.fonts.ready.then(function() {
            fontsLoaded = true;
            checkReady();
          }).catch(function() {
            fontsLoaded = true;
            checkReady();
          });
        } else {
          fontsLoaded = true;
        }

        window.addEventListener('load', function() {
          var images = document.getElementsByTagName('img');
          var imagesToLoad = images.length;

          if (imagesToLoad === 0) {
            imagesLoaded = true;
            checkReady();
          } else {
            var loadedCount = 0;
            for (var i = 0; i < images.length; i++) {
              if (images[i].complete) {
                loadedCount++;
              } else {
                images[i].addEventListener('load', function() {
                  loadedCount++;
                  if (loadedCount === imagesToLoad) {
                    imagesLoaded = true;
                    checkReady();
                  }
                });
                images[i].addEventListener('error', function() {
                  loadedCount++;
                  if (loadedCount === imagesToLoad) {
                    imagesLoaded = true;
                    checkReady();
                  }
                });
              }
            }
            if (loadedCount === imagesToLoad) {
              imagesLoaded = true;
              checkReady();
            }
          }
        });

        setTimeout(function() {
          fontsLoaded = true;
          imagesLoaded = true;
          checkReady();
        }, 3000);
      }
    })();
  </script>
</head>
<body>
  ${combinedContent}
</body>
</html>`;
}
