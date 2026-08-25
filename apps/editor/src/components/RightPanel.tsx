import {
  Check,
  Highlighter,
  ImagePlus,
  PenTool,
  ShieldCheck,
  Type,
  FileArchive,
} from "lucide-react";
import type { MouseEvent, ReactNode } from "react";
import { RippleButton } from "./ui/RippleButton";
import { GoogleAdSlot } from "./GoogleAdSlot";
import { formatFileSize } from "../lib/format";
import type { EditorTab, PdfFileItem, ToolKind } from "../types/editor";

interface RightPanelProps {
  activeTab: EditorTab;
  activeTool: ToolKind | null;
  documents: PdfFileItem[];
  disabled: boolean;
  signatureImage: string | null;
  editorImage: string | null;
  currentHighlightColor: string;
  compressionLevel: number;
  onTabChange: (tab: EditorTab) => void;
  onToolChange: (tool: ToolKind) => void;
  onHighlightColor: (color: string) => void;
  onPickSignature: () => void;
  onPickEditorImage: () => void;
  onCompressionChange: (level: number) => void;
}

const toolCards: Array<{
  key: ToolKind;
  title: string;
  subtitle: string;
  icon: ReactNode;
}> = [
  {
    key: "edit",
    title: "Edit Text",
    subtitle: "Edit PDF text content",
    icon: <Type size={15} />,
  },
  {
    key: "highlight",
    title: "Highlight",
    subtitle: "Color based highlight",
    icon: <Highlighter size={15} />,
  },
  {
    key: "signature",
    title: "Signature",
    subtitle: "Insert signature image",
    icon: <PenTool size={15} />,
  },
  {
    key: "image",
    title: "Add Image",
    subtitle: "Insert resizable image",
    icon: <ImagePlus size={15} />,
  },
];

const highlightColors = [
  { label: "Green", value: "#22c55e40" },
  { label: "Red", value: "#ef444440" },
  { label: "Yellow", value: "#facc1540" },
  { label: "Blue", value: "#3b82f640" },
  { label: "Purple", value: "#a855f740" },
];

const compressionDescriptions = [
  "No compression applied.",
  "Very light compression with near-original quality.",
  "Light compression with minimal quality loss.",
  "Low compression with slight quality reduction.",
  "Balanced compression with modest quality reduction.",
  "Medium compression with moderate quality reduction.",
  "Medium-high compression for smaller files.",
  "High compression with noticeable quality reduction.",
  "Very high compression with reduced quality.",
  "Maximum compression with lowest quality.",
];

const runEditableFrameCommand = (
  command: string,
  value?: string,
) => {
  const iframes = document.querySelectorAll("iframe");

  iframes.forEach((iframe) => {
    try {
      const frameDocument = iframe.contentDocument;
      if (!frameDocument?.body?.isContentEditable) {
        return;
      }

      frameDocument.execCommand("styleWithCSS", false, "true");
      frameDocument.execCommand(command, false, value);
      frameDocument.dispatchEvent(new Event("input", { bubbles: true }));
    } catch {
      // Ignore iframe access errors.
    }
  });
};

export function RightPanel({
  activeTab,
  activeTool,
  documents,
  disabled,
  signatureImage,
  editorImage,
  currentHighlightColor,
  compressionLevel,
  onTabChange,
  onToolChange,
  onHighlightColor,
  onPickSignature,
  onPickEditorImage,
  onCompressionChange,
}: RightPanelProps) {
  const isPanelDisabled = disabled || documents.length === 0;

  const stopMouseDown = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  return (
    <aside className="flex flex-col border-l border-[#e4e8f0] bg-[#f2f4f7] pb-2.5">
      <div className="grid grid-cols-3 border-b border-[#e4e8f0]">
        <RippleButton
          type="button"
          className={`h-10 cursor-pointer border-none bg-transparent text-xs ${
            activeTab === "edit"
              ? "border-b-2 border-b-blue-500 font-semibold text-blue-600"
              : "text-slate-600"
          }`}
          onClick={() => onTabChange("edit")}
          disabled={isPanelDisabled}
        >
          Edit
        </RippleButton>
        <RippleButton
          type="button"
          className={`h-10 cursor-pointer border-none bg-transparent text-xs ${
            activeTab === "marge"
              ? "border-b-2 border-b-blue-500 font-semibold text-blue-600"
              : "text-slate-600"
          }`}
          onClick={() => onTabChange("marge")}
          disabled={isPanelDisabled}
        >
          Merge
        </RippleButton>
        <RippleButton
          type="button"
          className={`h-10 cursor-pointer border-none bg-transparent text-xs ${
            activeTab === "compress"
              ? "border-b-2 border-b-blue-500 font-semibold text-blue-600"
              : "text-slate-600"
          }`}
          onClick={() => onTabChange("compress")}
          disabled={isPanelDisabled}
        >
          Compress
        </RippleButton>
      </div>

      {activeTab === "edit" ? (
        <div className="flex flex-col gap-[9px] p-3">
          <div className="text-[10px] font-bold tracking-[0.06em] text-slate-500 uppercase">
            Edit & Formatting Tools
          </div>
          <p className="text-[11px] leading-relaxed text-slate-400">
            Select a tool below, then click anywhere on your document to apply it.
            Formatting controls appear automatically after you select a tool.
          </p>

          {toolCards.map((card) => (
            <RippleButton
              key={card.key}
              type="button"
              className={`flex items-center gap-2.5 rounded-lg border px-2.5 py-2.5 text-left ${
                activeTool === card.key
                  ? "border-blue-500 bg-blue-50"
                  : "border-[#dce3f0] bg-slate-50"
              }`}
              onClick={() => onToolChange(card.key)}
              disabled={isPanelDisabled}
            >
              <div className="grid h-[26px] w-[26px] place-items-center rounded-md bg-[#edf2ff] text-blue-600">
                {card.icon}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800">
                  {card.title}
                </div>
                <div className="mt-0.5 text-[11px] text-slate-500">
                  {card.subtitle}
                </div>
              </div>
            </RippleButton>
          ))}

          {activeTool === "edit" ? (
            <div className="mt-2 flex flex-col gap-2 rounded-lg border border-[#dce3f0] bg-white p-2.5">
              <div className="text-[11px] text-slate-600">Text Formatting</div>
              <div className="flex flex-wrap gap-1.5">
                <RippleButton
                  type="button"
                  className="inline-flex h-7 w-7 items-center justify-center rounded border border-[#d5ddeb] bg-white text-xs font-bold"
                  onMouseDown={stopMouseDown}
                  onClick={() => runEditableFrameCommand("bold")}
                  disabled={isPanelDisabled}
                  title="Bold"
                >
                  B
                </RippleButton>
                <RippleButton
                  type="button"
                  className="inline-flex h-7 w-7 items-center justify-center rounded border border-[#d5ddeb] bg-white text-xs italic"
                  onMouseDown={stopMouseDown}
                  onClick={() => runEditableFrameCommand("italic")}
                  disabled={isPanelDisabled}
                  title="Italic"
                >
                  I
                </RippleButton>
                <RippleButton
                  type="button"
                  className="inline-flex h-7 w-7 items-center justify-center rounded border border-[#d5ddeb] bg-white text-xs underline"
                  onMouseDown={stopMouseDown}
                  onClick={() => runEditableFrameCommand("underline")}
                  disabled={isPanelDisabled}
                  title="Underline"
                >
                  U
                </RippleButton>
              </div>
              <div className="flex flex-col gap-2">
                <select
                  className="flex-1 rounded border border-[#d5ddeb] px-2 py-1 text-xs"
                  onChange={(e) => {
                    runEditableFrameCommand("fontSize", e.target.value);
                  }}
                  disabled={isPanelDisabled}
                >
                  <option value="1">Small</option>
                  <option value="3">Normal</option>
                  <option value="5">Large</option>
                  <option value="7">X-Large</option>
                </select>
                <input
                  type="color"
                  className="h-7 w-full rounded border border-[#d5ddeb]"
                  onChange={(e) => {
                    runEditableFrameCommand("foreColor", e.target.value);
                  }}
                  disabled={isPanelDisabled}
                  title="Text Color"
                />
              </div>
            </div>
          ) : null}

          {activeTool === "highlight" ? (
            <div className="mt-2 flex flex-col gap-2 rounded-lg border border-[#dce3f0] bg-white p-2.5">
              <div className="text-[11px] text-slate-600">Highlight Colors</div>
              <div className="flex flex-wrap gap-2">
                {highlightColors.map((color) => {
                  const isSelected = color.value === currentHighlightColor;

                  return (
                    <RippleButton
                      key={color.value}
                      type="button"
                      className={`inline-flex items-center gap-1.5 rounded-md border bg-white px-2 py-1 text-[11px] text-slate-700 ${
                        isSelected
                          ? "border-blue-500 ring-2 ring-blue-200"
                          : "border-[#d5ddeb]"
                      }`}
                      onMouseDown={stopMouseDown}
                      onClick={() => onHighlightColor(color.value)}
                      aria-pressed={isSelected}
                      disabled={isPanelDisabled}
                    >
                      <span
                        className="h-3.5 w-3.5 rounded-full border border-slate-300"
                        style={{ backgroundColor: color.value }}
                      />
                      {isSelected ? (
                        <Check size={12} className="text-blue-600" />
                      ) : null}
                      {color.label}
                    </RippleButton>
                  );
                })}
              </div>
            </div>
          ) : null}

          {activeTool === "signature" ? (
            <div className="mt-2 flex flex-col gap-2 rounded-lg border border-[#dce3f0] bg-white p-2.5">
              <RippleButton
                type="button"
                className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-[#d7e1f2] bg-white text-xs font-semibold text-slate-700"
                onMouseDown={stopMouseDown}
                onClick={onPickSignature}
                disabled={isPanelDisabled}
              >
                <PenTool size={14} />
                {signatureImage ? "Change signature" : "Upload signature"}
              </RippleButton>
              <div className="text-[10px] text-slate-500">
                Max file size: 5MB
              </div>
              {signatureImage ? (
                <img
                  src={signatureImage}
                  alt="signature preview"
                  className="max-h-50 w-auto rounded border border-[#d5ddeb] bg-white object-contain"
                />
              ) : null}
            </div>
          ) : null}

          {activeTool === "image" ? (
            <div className="mt-2 flex flex-col gap-2 rounded-lg border border-[#dce3f0] bg-white p-2.5">
              <RippleButton
                type="button"
                className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-[#d7e1f2] bg-white text-xs font-semibold text-slate-700"
                onMouseDown={stopMouseDown}
                onClick={onPickEditorImage}
                disabled={isPanelDisabled}
              >
                <ImagePlus size={14} />
                {editorImage ? "Change image" : "Add image"}
              </RippleButton>
              <div className="text-[10px] text-slate-500">
                Max file size: 10MB
              </div>
              {editorImage ? (
                <img
                  src={editorImage}
                  alt="image preview"
                  className="max-h-50 w-auto rounded border border-[#d5ddeb] bg-white object-contain"
                />
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}

      {activeTab === "marge" ? (
        <div className="flex flex-col gap-[9px] p-3">
          <div className="text-[10px] font-bold tracking-[0.06em] text-slate-500 uppercase">
            Document Info
          </div>
          <p className="text-[11px] leading-relaxed text-slate-400">
            All uploaded files will be merged into one PDF in the order shown in
            the left panel. Drag pages in the sidebar to reorder before exporting.
          </p>
          <div className="-mt-[4px] ml-auto w-fit rounded-full border border-[#bcd3ff] bg-[#e8f0ff] px-2 py-0.5 text-[10px] text-blue-600">
            {documents.length} files
          </div>

          {documents.map((document) => (
            <div
              className="flex items-center justify-between gap-2 rounded-lg border border-[#dce3f0] bg-slate-50 p-2.5"
              key={document.id}
            >
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} />
                <div>
                  <div
                    className="text-xs font-semibold text-gray-800 line-clamp-1"
                    title={document.name}
                  >
                    {document.name}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {formatFileSize(document.size)} • {document.pageCount} pages
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {activeTab === "compress" ? (
        <div className="flex flex-col gap-[9px] p-3">
          <div className="text-[10px] font-bold tracking-[0.06em] text-slate-500 uppercase">
            Compress PDF
          </div>
          <p className="text-[11px] leading-relaxed text-slate-400">
            Reduce your PDF file size for faster sharing and smaller email attachments.
            Slide to 0 to keep original quality, or 9 for maximum compression.
          </p>
          <div className="flex flex-col gap-2 rounded-lg border border-[#dce3f0] bg-white p-2.5">
            <div className="flex items-center gap-2 text-blue-600">
              <FileArchive size={16} />
              <span className="text-xs font-semibold">Compression Options</span>
            </div>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-700">
                Quality Adjustment
              </span>
              <span className="rounded-md border border-[#d5ddeb] bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                {compressionLevel}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={9}
              step={1}
              value={compressionLevel}
              onChange={(event) =>
                onCompressionChange(Number(event.target.value))
              }
              className="h-2 w-full cursor-pointer accent-blue-500"
              disabled={isPanelDisabled}
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>0</span>
              <span>9</span>
            </div>
            <p className="text-[11px] text-slate-600">
              {compressionDescriptions[compressionLevel] ??
                "Compression will be applied during export."}
            </p>
          </div>
        </div>
      ) : null}

      <GoogleAdSlot
        adSlot={import.meta.env.VITE_ADSENSE_SLOT_RIGHT_PANEL ?? ""}
        className="grid h-[180px] place-items-center rounded-lg border border-[#d5deeb] bg-[#eef2f7] text-[11px] text-[#a3aebb] mx-3 mt-auto"
        fallbackLabel="Ad Space"
      />
    </aside>
  );
}
