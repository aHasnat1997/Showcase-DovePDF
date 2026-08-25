# Acme-PDF - Comprehensive Technical Documentation for AI Agents

## Project Overview

Acme-PDF is a modern, full-stack PDF editor application built with TypeScript, React, and Express. It allows users to upload, edit, annotate, merge PDFs, and export them with professional quality. The project uses a turborepo monorepo structure with Bun as the runtime environment.

## Key Capabilities

- PDF viewing, editing, and annotation (text, highlights, signatures, images)
- PDF to HTML conversion and HTML to PDF export
- Image to PDF conversion
- PDF compression
- Multi-page document management
- Export to PDF and DOCX formats
- Undo/Redo functionality
- Persistent state with IndexedDB

## Tech Stack

- Frontend (apps/web)
- React 19.2 - UI library
- Vite 8.0 - Build tool and dev server
- TypeScript 5.9 - Type safety
- TailwindCSS 4.2 - Utility-first CSS framework
- Zustand - State management with IndexedDB persistence
- pdf-lib - PDF manipulation
- pdfjs-dist 5.4.296 - PDF rendering
- react-pdf - PDF viewer component
- html2canvas - HTML to canvas conversion
- jspdf - Client-side PDF generation
- Lucide React - Icon library
- Backend (packages/api)
- Express 5.2 - Web server
- tRPC 11.13 - End-to-end type-safe APIs
- Bun - JavaScript runtime
- Multer 2.1 - File upload middleware
- html-to-docx - HTML to DOCX conversion
- JSZip - ZIP file handling
- CORS - Cross-origin resource sharing
- Zod 4.1 - Schema validation

### External Services

- Stirling PDF - PDF to HTML conversion service
- Chrome Headless - HTML to PDF rendering (fallback to Stirling)
- Monorepo Tools
- Turborepo 2.6 - Build system orchestration
- Bun Workspaces - Package management

## Project Structure

Acme-PDF/
├── apps/
│ ├── web/ # Main React SPA (PDF Editor)
│ │ ├── src/
│ │ │ ├── components/ # React components
│ │ │ │ ├── ui/ # Reusable UI components
│ │ │ │ ├── TopBar.tsx # Top navigation/controls
│ │ │ │ ├── LeftSidebar.tsx # Page thumbnails sidebar
│ │ │ │ ├── RightPanel.tsx # Tools and settings panel
│ │ │ │ ├── PreviewPane.tsx # Main PDF preview area
│ │ │ │ └── ExportModal.tsx # Export confirmation modal
│ │ │ ├── hooks/ # Custom React hooks
│ │ │ │ ├── usePdfExport.ts # PDF export logic
│ │ │ │ └── useUndoRedo.ts # Undo/redo history
│ │ │ ├── lib/ # Core libraries
│ │ │ │ ├── pdf.ts # PDF manipulation (pdf-lib)
│ │ │ │ ├── pdfjs.ts # PDF.js initialization
│ │ │ │ └── format.ts # Formatting utilities
│ │ │ ├── store/ # Zustand state management
│ │ │ │ └── editorStore.ts # Main editor state
│ │ │ ├── types/ # TypeScript type definitions
│ │ │ │ └── editor.ts # Editor domain types
│ │ │ ├── utils/ # Utility functions
│ │ │ │ ├── applyOverlaysToHtml.ts # Apply annotations to HTML
│ │ │ │ ├── buildHtmlDoc.ts # HTML document builder
│ │ │ │ ├── wrapHtmlForPdfExport.ts # PDF export wrapper
│ │ │ │ └── exportPdfClient.ts # Client-side PDF export
│ │ │ ├── App.tsx # Main application component
│ │ │ └── main.tsx # Application entry point
│ │ ├── vite.config.ts # Vite configuration
│ │ └── package.json # Web app dependencies
│ │
│ └── landing-page/ # Marketing landing page (Vite + Vanilla)
│ ├── src/
│ │ ├── sections/ # Landing page sections
│ │ ├── landing-content.ts # Content data
│ │ ├── landing-render.ts # DOM rendering logic
│ │ └── style.css # Landing page styles
│ └── package.json
│
├── packages/
│ ├── api/ # Express + tRPC Backend
│ │ ├── src/
│ │ │ ├── routers/ # tRPC route definitions
│ │ │ │ ├── index.ts # Router aggregation
│ │ │ │ └── pdf.ts # PDF-specific routes
│ │ │ ├── types/ # Type declarations
│ │ │ │ ├── html-to-docx.d.ts
│ │ │ │ └── pdf2html.d.ts
│ │ │ ├── utils/ # Utility functions
│ │ │ │ └── upload.ts # File upload middleware
│ │ │ ├── context.ts # tRPC context
│ │ │ ├── index.ts # tRPC initialization
│ │ │ └── server.ts # Express server & API endpoints
│ │ └── package.json
│ │
│ ├── config/ # Shared TypeScript configs
│ │ └── tsconfig.base.json # Base TS configuration
│ │
│ └── env/ # Environment variable validation
│ ├── src/
│ │ ├── server.ts # Server environment schema
│ │ ├── web.ts # Web client environment schema
│ │ ├── shared.ts # Shared environment variables
│ │ └── native.ts # Native app environment (future)
│ └── package.json
│
├── docker-compose.yml # Docker Compose configuration
├── Dockerfile # Production Docker image
├── Dockerfile.api # API-specific Docker image
├── Dockerfile.web # Web-specific Docker image
├── turbo.json # Turborepo configuration
├── package.json # Root workspace configuration
├── bun.lock # Bun lockfile
└── README.md # Project documentation

### EditorState (apps/web/src/store/editorStore.ts)

The application's global state managed by Zustand:

interface EditorState {
// Document management
documents: PdfFileItem[]; // All loaded PDF/image documents
combinedPages: CombinedPageRef[]; // Flattened list of all pages
exportFileName: string; // Name for exported file

// UI state
activeDocumentId: string | null; // Currently selected document
selectedPage: number; // Selected page index
activeTab: EditorTab; // 'edit' | 'merge' | 'compress'
activeTool: ToolKind | null; // Active editing tool
isBusy: boolean; // Loading/processing state
isExportOpen: boolean; // Export modal visibility
previewZoom: number; // Zoom level (50-150)
compressionLevel: number; // Compression level (0-9)

// Editor data
overlays: OverlayItem[]; // Annotations/edits on pages
pageSizes: Record<string, {width, height}>; // Natural page dimensions

// Actions (methods for state updates)
addPdfFiles(files: File[]): Promise<PdfFileItem[]>;
removeDocument(id: string): void;
setActiveDocument(id: string): void;
addOverlay(overlay: OverlayItem): void;
updateOverlay(id: string, patch: OverlayPatch): void;
removeOverlay(id: string): void;
setPageSize(pageId: string, size: {width, height}): void;
clearWorkspace(): void;
// ... more actions
}

### PdfFileItem

Represents an uploaded document:

interface PdfFileItem {
id: string; // Unique identifier
name: string; // Original filename
sourceType: "pdf" | "image"; // File source type
size: number; // File size in bytes
bytes: Uint8Array; // Raw file data
previewImageDataUrl?: string; // Data URL for image preview
pageCount: number; // Number of pages
pageOrder: number[]; // Page ordering array
htmlPages?: HtmlPage[]; // Converted HTML pages (for editing)
}

### OverlayItem

Represents an annotation/edit on a PDF page:

interface OverlayItem {
id: string; // Unique identifier
docId: string; // Parent document ID
type: ToolKind; // 'edit' | 'highlight' | 'signature' | 'image'
pageIndex: number; // Page number (0-based)
pageId: string; // Composite ID "docId:pageIndex"
x: number; // X position (pixels)
y: number; // Y position (pixels)
width: number; // Width (pixels)
height: number; // Height (pixels)
imageDataUrl?: string; // Data URL for image/signature
highlightColor?: string; // Highlight color (hex)
}

### CombinedPageRef

Reference to a page in the combined document view:

interface CombinedPageRef {
id: string; // "docId:sourcePage"
docId: string; // Parent document ID
sourcePage: number; // Original page number
}

### API Endpoints (packages/api/src/server.ts)

POST /api/pdf/export
Convert uploaded PDF to HTML pages for editing.

Request:

Content-Type: multipart/form-data

Field: pdf (file)

Response:

{
"success": true,
"pages": [
{
"name": "page-1.html",
"html": "<html>...</html>"
}
],
"fileName": "document"
}

Process:

Validates PDF file

Sends to Stirling PDF service

Receives ZIP archive with HTML pages and fonts

Extracts and processes HTML with embedded fonts

Returns array of HTML pages

POST /api/pdf/compress
Compress PDF using Stirling PDF service.

Request:

Content-Type: multipart/form-data

Field: pdf (file)

Field: compressionLevel (number, 0-9)

Response:

Binary PDF data (application/pdf)

Process:

Validates PDF file

Sends to Stirling PDF /api/v1/misc/compress-pdf

Returns compressed PDF buffer

POST /api/html/export-pdf
Convert HTML content to PDF (used for exporting edited documents).

Request:

{
"htmlContent": "<html>...</html>",
"fileName": "document.pdf",
"compressionLevel": 2
}

Response:

Binary PDF data (application/pdf)

Process:

Try Chrome Headless rendering first (faster, better quality)

Fallback to Stirling PDF if Chrome fails

Optional compression via Stirling PDF

Returns PDF buffer

POST /api/docx/export
Convert HTML to DOCX format.

Request:

{
"htmlContent": "<html>...</html>",
"fileName": "document.docx"
}

Response:

Binary DOCX data (application/vnd.openxmlformats-officedocument.wordprocessingml.document)

Process:

Uses html-to-docx library

Converts HTML to Word document

Returns DOCX buffer

GET /health
Health check endpoint.

Response: "OK"

Environment Variables
Server (packages/env/src/server.ts)

# Server Configuration

PORT=5050 # API server port
CORS_ORIGIN=http://localhost:5050 # API server URL for CORS
EDITOR_URL=http://localhost:5173 # Web editor URL

# Stirling PDF Integration

STIRLING_PDF_URL=https://stirlingpdf.example.com
STIRLING_PDF_API_KEY= # Optional API key (X-API-KEY header)
STIRLING_PDF_FONTS_DIR= # Optional custom fonts directory

# Chrome Configuration

CHROME_PATH=/usr/bin/google-chrome # Path to Chrome executable

Copy
env
Web Client (packages/env/src/web.ts)

# API Configuration

VITE_SERVER_URL=http://localhost:5050 # Backend API URL
VITE_API_HOST=localhost # API hostname

# Analytics & Ads (optional)

VITE_GA_MEASUREMENT_ID= # Google Analytics 4 ID
VITE_ADSENSE_CLIENT_ID= # Google AdSense client ID
VITE_ADSENSE_SLOT_RIGHT_PANEL= # AdSense slot for right panel
VITE_ADSENSE_SLOT_PREVIEW_EMPTY= # AdSense slot for empty preview

Copy
env
Key Workflows

1. PDF Upload and Processing
   Client Side (apps/web/src/App.tsx):

handlePdfFiles() {

1. User selects PDF/image files
2. For each file:
   - If PDF: send to /api/pdf/export for HTML conversion
   - If image: convert to PDF using pdf-lib
3. Store files in editorStore.documents[]
4. Store HTML pages in document.htmlPages[]
5. Generate combinedPages[] refs
6. Set first document as active
   }

Copy
typescript
Server Side (packages/api/src/server.ts):

POST /api/pdf/export {

1. Receive PDF file via Multer
2. Send to Stirling PDF: /api/v1/convert/pdf/html
3. Receive ZIP archive with HTML pages + fonts
4. Extract HTML pages (numbered: page-1.html, page-2.html...)
5. Extract font files (.ttf, .woff, .woff2)
6. Inject @font-face CSS into each HTML page
7. Convert image references to data URLs
8. Return array of {name, html} objects
   }

Copy
typescript 2. PDF Annotation (Overlays)
User Actions:

// User clicks tool in RightPanel
setActiveTool('highlight' | 'signature' | 'image')

// User draws/places on PreviewPane
addOverlay({
id: uid(),
docId: activeDocumentId,
type: activeTool,
pageIndex: selectedPage,
pageId: `${docId}:${pageIndex}`,
x, y, width, height,
imageDataUrl?: string, // for signature/image
highlightColor?: string // for highlight
})

// Overlays stored in editorStore.overlays[]
// Rendered as absolutely positioned divs in PreviewPane

Copy
typescript
Undo/Redo:

// useUndoRedo hook tracks overlay history
pushHistory(overlays) // On each change
undo() → previousOverlays // Restore previous state
redo() → nextOverlays // Restore next state

// Keyboard shortcuts: Ctrl+Z, Ctrl+Shift+Z

Copy
typescript 3. PDF Export with Edits
Two Export Paths:

A. No HTML Edits (Direct PDF Export)

1. Apply overlays to original PDF bytes using pdf-lib
2. applyPdfOverlays(bytes, overlays, combinedPages)
   - For each overlay:
     - Draw image (signature/image overlay)
     - Draw rectangle (highlight)
3. Return modified PDF bytes
4. Download directly

Copy
typescript
B. With HTML Edits (HTML→PDF Export)

1. For each page with HTML edits:
   - Get document.htmlPages[pageIndex].html
   - Apply overlays: applyOverlaysToHtml()
   - Inject overlays as absolutely positioned elements
2. Wrap all pages: wrapHtmlForPdfExport()
   - Add page-break-after CSS
   - Inject custom fonts
   - Set page dimensions
3. Send to /api/html/export-pdf
4. Server renders via Chrome Headless or Stirling PDF
5. Optional compression
6. Download PDF

Copy
typescript 4. State Persistence
IndexedDB Storage:

// Uses Zustand persist middleware with custom IndexedDB storage
// Database: "pdf-viewer-db"
// Store: "zustand-store"
// Storage key: "pdf-viewer-cache-v1"

// Persisted data:

- documents (with Uint8Array→base64 serialization)
- combinedPages
- overlays
- exportFileName
- UI state (activeTab, activeTool, zoom, etc.)

// NOT persisted:

- pageSizes (rebuilt from iframes each session)
- isBusy, isExportOpen (transient UI state)

Copy
typescript
Common Issues and Solutions
Issue 1: Fonts Not Rendering in Exported PDF
Cause: Stirling PDF returns fonts in ZIP, but they're not properly embedded.

Solution:

Server extracts fonts from ZIP: loadFontsFromDir()

Infers font weight/style from filename: getFontWeightFromName()

Generates @font-face CSS with data URLs: buildFontFaceCss()

Injects into each HTML page: injectHeadStyle()

Code Location: packages/api/src/server.ts (lines 50-200)

Issue 2: PDF Export Loses Color Accuracy
Cause: HTML→PDF conversion may alter colors.

Solution:

Use Chrome Headless with --force-color-profile=srgb

If no HTML edits, export directly from original PDF bytes

Only use HTML→PDF when user modified HTML content

Code Location: apps/web/src/App.tsx → handleDownload() (lines 395-450)

Issue 3: Large Files Cause Memory Issues
Cause: PDF bytes stored in IndexedDB as base64.

Solution:

Use chunked base64 encoding: bytesToBase64() with 0x8000 chunk size

Lazy-load HTML pages only when needed

Clear workspace after export: clearWorkspace()

Code Location: apps/web/src/store/editorStore.ts (lines 70-90)

Issue 4: Overlays Misaligned on Export
Cause: Preview uses scaled rendering, but export needs natural dimensions.

Solution:

Store natural page sizes: setPageSize(pageId, {width, height})

Use natural dimensions when applying overlays for export

applyOverlaysToHtml() scales overlay positions to natural size

Code Location:

apps/web/src/utils/applyOverlaysToHtml.ts

apps/web/src/store/editorStore.ts → setPageSize()

Development Commands

# Install dependencies

bun install

# Run full stack (landing + web + api)

bun run dev

# Run individual apps

bun run dev:web # Web editor only (port 5173)
bun run dev:api # API server only (port 5050)
bun run dev:landing # Landing page only

# Build all apps

bun run build

# Type checking

bun run check-types

Copy
bash
Deployment
Docker Deployment

# Build and run with Docker Compose

docker-compose up -d

# Individual Dockerfiles available:

- Dockerfile # Full monorepo build
- Dockerfile.api # API-only image
- Dockerfile.web # Web-only image

Copy
bash
Environment Setup for Production

# Update these in production .env

CORS_ORIGIN=https://api.acmepdf.com
EDITOR_URL=https://editor.acmepdf.com
STIRLING_PDF_URL=https://your-stirling-instance.com
STIRLING_PDF_API_KEY=your-secret-key

Copy
env
External Dependencies
Stirling PDF Service
Purpose: PDF↔HTML conversion, PDF compression

Required Endpoints:

POST /api/v1/convert/pdf/html - PDF to HTML

POST /api/v1/convert/html/pdf - HTML to PDF

POST /api/v1/misc/compress-pdf - PDF compression

Authentication: Optional X-API-KEY header

Response Format:

PDF→HTML: Returns ZIP archive with HTML pages + fonts

HTML→PDF: Returns binary PDF

Compression: Returns binary PDF

Chrome Headless
Purpose: High-quality HTML→PDF rendering (primary method)

Fallback: Stirling PDF if Chrome unavailable

Configuration:

// Chrome flags for PDF export
--headless=new
--disable-gpu
--no-sandbox
--print-to-pdf-no-header
--force-color-profile=srgb
--virtual-time-budget=15000

Copy
typescript
Testing Strategy
Manual Testing Checklist
Upload Tests

Upload single PDF
Upload multiple PDFs
Upload images (PNG, JPG, WEBP)
Mixed PDF + image uploads
Editing Tests

Add text highlights
Add signature
Add images
Resize/move overlays
Delete overlays
Undo/redo edits (Ctrl+Z)
Export Tests

Export PDF without HTML edits
Export PDF with HTML edits
Export DOCX
Compression levels (0-3)
Verify fonts in exported PDF
Verify colors match original
State Persistence

Refresh page mid-edit
Verify workspace restored
Clear workspace
Performance Optimization
Current Bottlenecks
PDF→HTML Conversion: Stirling PDF API (external network call)

HTML→PDF Export: Chrome rendering (CPU intensive)

State Persistence: Large PDF files in IndexedDB

Optimization Strategies
Lazy Loading: Only convert pages to HTML when user clicks "Edit"

Caching: Store converted HTML pages in document.htmlPages

Chunked Encoding: Use 32KB chunks for base64 conversion

Compression: Offer compression levels 0-3 for export

Web Workers: Consider moving PDF manipulation to Web Workers

Security Considerations
File Upload Limits:

Signature images: 5MB max

Content images: 10MB max

PDFs: No hard limit (consider adding)

Input Validation:

File type checking (MIME + extension)

Zod schema validation on API inputs

CORS Configuration:

Whitelist specific origins

Don't use wildcard (\*) in production

Environment Variables:

Never commit .env files

Use secret management in production

API Key Protection:

Stirling PDF API key stored server-side only

Not exposed to client

Future Enhancements
Real-time Collaboration: WebSocket support for multi-user editing

Cloud Storage: Integration with Google Drive, Dropbox

OCR Support: Text extraction from scanned PDFs

Form Filling: Interactive PDF form support

Digital Signatures: Cryptographic signature support

Batch Processing: Process multiple files in queue

Mobile App: React Native version using shared packages

Troubleshooting Guide
Problem: "Chrome executable not found"
Solution:

# Install Chrome on Ubuntu/Debian

sudo apt-get install google-chrome-stable

# Or set custom path

export CHROME_PATH=/path/to/chrome

Copy
bash
Problem: "StirlingPDF request failed with 401"
Solution:
Check STIRLING_PDF_API_KEY environment variable matches server configuration.

Problem: Fonts missing in exported PDF
Solution:

Ensure Stirling PDF returns ZIP (not just HTML)

Check buildFontFaceCss() extracts fonts correctly

Verify injectHeadStyle() adds @font-face rules

Inspect exported HTML for data URL fonts

Problem: Overlays misaligned in export
Solution:

Verify setPageSize() is called from HtmlPageFrame

Check pageSizes[pageId] has correct natural dimensions

Ensure applyOverlaysToHtml() uses natural size for scaling

Test with different zoom levels

Code Quality Standards
TypeScript Rules
Strict mode enabled

No any types without explicit reason

Explicit return types for functions

Proper null/undefined handling

React Best Practices
Functional components with hooks

Memoization for expensive operations (useMemo, useCallback)

Proper dependency arrays in useEffect

Error boundaries for PDF rendering

State Management
Single source of truth (Zustand store)

Immutable state updates

Derived state via selectors

Action creators for complex updates

Monitoring and Logging
Server Logs
console.log(`Converting PDF: ${uploadedFilePath}`)
console.log(`Successfully converted PDF: ${fileName}`)
console.error('PDF conversion error:', convertError)
console.log(`Deleted temporary PDF: ${uploadedFilePath}`)

Copy
typescript
Client Errors
window.alert(`Export failed: ${error.message}`)
console.error('Export failed:', error)

Copy
typescript
Production Recommendations
Use structured logging (Winston, Pino)

Add request ID tracing

Monitor Stirling PDF API latency

Track conversion success rates

Alert on repeated failures

License and Credits
Created with: Better Fullstack (https://github.com/Marve10s/Better-Fullstack)

Key Technologies:

React + Vite

Express + tRPC

pdf-lib, pdfjs-dist

TailwindCSS

Zustand

Bun runtime

AI Agent Guidelines
When modifying this codebase:

Respect Type Safety: Always maintain TypeScript types

Preserve State Flow: Don't bypass Zustand store for state

Test PDF Export: Verify both direct and HTML→PDF paths

Check Font Embedding: Ensure fonts work after changes

Validate Environment: Check all env vars are documented

Maintain Undo/Redo: Test history tracking after overlay changes

Preserve IndexedDB: Don't break persistence layer

Consider Performance: Large PDFs are memory-intensive

Document Changes: Update this file for major modifications

Security First: Validate all inputs, especially file uploads

This documentation should serve as a complete reference for AI agents to understand, modify, and extend the Acme-PDF codebase effectively.
