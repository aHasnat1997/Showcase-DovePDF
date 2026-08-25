import { Download, X } from "lucide-react";
import { createPortal } from "react-dom";
import { RippleButton } from "./ui/RippleButton";
import { formatFileSize } from "../lib/format";

interface ExportModalProps {
  open: boolean;
  fileName: string;
  pageCount: number;
  fileSize: number;
  onClose: () => void;
  onDownload: () => void;
}

export function ExportModal({
  open,
  fileName,
  pageCount,
  fileSize,
  onClose,
  onDownload,
}: ExportModalProps) {
  if (!open || typeof document === "undefined") {
    return null;
  }

  const handleDownload = () => {
    onDownload();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] grid place-items-center bg-slate-900/55"
      role="presentation"
    >
      <div
        className="w-[min(440px,calc(100vw-24px))] overflow-hidden rounded-[10px] bg-white shadow-[0_30px_55px_rgba(15,23,42,0.35)]"
        role="dialog"
        aria-modal="true"
        aria-label="Export PDF"
      >
        <div className="flex h-[50px] items-center justify-between bg-linear-to-br from-[#5fa8ff] to-[#3e7df8] px-[14px] text-white">
          <div className="inline-flex items-center gap-[7px] text-[22px] font-bold">
            <Download size={15} />
            Export PDF
          </div>
          <RippleButton
            type="button"
            onClick={onClose}
            aria-label="Close export modal"
            className="cursor-pointer border-none bg-transparent text-[#e8f1ff]"
          >
            <X size={16} />
          </RippleButton>
        </div>

        <div className="p-[14px]">
          <div className="grid gap-2 rounded-lg border border-[#cde0ff] bg-[#f5f9ff] p-3">
            <div className="flex justify-between text-xs text-slate-700">
              <span>File Name:</span>
              <strong>{fileName}</strong>
            </div>
            <div className="flex justify-between text-xs text-slate-700">
              <span>Total Pages:</span>
              <strong>{pageCount}</strong>
            </div>
            <div className="flex justify-between text-xs text-slate-700">
              <span>Original Size:</span>
              <strong>{formatFileSize(fileSize)}</strong>
            </div>
            <div className="flex justify-between text-xs text-slate-700">
              <span>Format:</span>
              <strong>PDF</strong>
            </div>
          </div>

          <div className="mt-3 rounded-lg border border-[#b4eacb] bg-emerald-50 p-2.5 text-xs text-emerald-800">
            All changes have been applied and your document is ready for
            download.
          </div>
        </div>

        <div className="flex justify-end gap-2.5 border-t border-[#e6edf8] px-[14px] py-2.5">
          <RippleButton
            type="button"
            className="inline-flex h-[33px] min-w-20 items-center justify-center rounded-lg border border-[#d3dded] bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
            onClick={onClose}
          >
            Cancel
          </RippleButton>
          <RippleButton
            type="button"
            className="inline-flex h-[33px] min-w-[120px] items-center justify-center gap-1.5 rounded-lg border border-[#4a8dec] bg-[#5ca1ff] px-3 text-xs font-semibold text-white transition hover:bg-[#4a8dec]"
            onClick={handleDownload}
          >
            <Download size={14} />
            Download PDF
          </RippleButton>
        </div>
      </div>
    </div>,
    document.body,
  );
}
