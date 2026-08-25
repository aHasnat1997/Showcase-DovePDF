#!/bin/bash

echo "🧹 Cleaning up unused dependencies..."

# Remove Tiptap packages
bun remove @tiptap/core @tiptap/extension-highlight @tiptap/extension-image @tiptap/extension-link @tiptap/extension-text-align @tiptap/extension-underline @tiptap/react @tiptap/starter-kit

# Remove DOCX and PDF generation packages
bun remove mammoth jspdf

echo "✅ Cleanup complete!"
echo ""
echo "📦 Installing remaining dependencies..."
bun install

echo ""
echo "✨ All done! Your codebase is now clean and ready to use."
