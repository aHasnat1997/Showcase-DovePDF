import { Download, Plus, Trash2, RotateCcw, RotateCw } from "lucide-react";
import Logo from "../assets/logo.svg?react";
import { RippleButton } from "./ui/RippleButton";

interface TopBarProps {
  fileName: string | null;
  onFileNameChange: (value: string) => void;
  onClear: () => void;
  onExport: () => void;
  onAddFiles: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  disabled: boolean;
}

export function TopBar({
  fileName,
  onFileNameChange,
  onClear,
  onExport,
  onAddFiles,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  disabled,
}: TopBarProps) {
  const commitName = (rawValue: string, restore: (value: string) => void) => {
    if (!fileName) {
      return;
    }

    const nextName = rawValue.trim();
    if (nextName.length === 0) {
      restore(fileName);
      return;
    }

    onFileNameChange(nextName);
    restore(nextName);
  };

  return (
    <header className="flex items-center justify-between border-b border-[#e4e6ec] bg-white px-[14px]">
      <div className="flex items-center gap-[10px]">
        <a href={`${import.meta.env.VITE_SERVER_URL || "/"}`}>
          <Logo />
        </a>

        {fileName ? (
          <>
            <div
              key={fileName}
              className="ml-[3px] flex items-center border-l border-slate-200 pl-[10px]"
            >
              <input
                defaultValue={fileName}
                onBlur={(event) => {
                  commitName(event.currentTarget.value, (value) => {
                    event.currentTarget.value = value;
                  });
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.currentTarget.blur();
                  }
                }}
                className="h-7 min-w-[220px] rounded-md border border-slate-200 bg-slate-50 px-2.5 text-xs text-slate-600 outline-none focus:border-blue-400"
                aria-label="Export file name"
              />
            </div>

            <RippleButton
              type="button"
              className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-transparent bg-[#3374f6] px-3 text-xs font-semibold text-white transition hover:bg-[#2f65d7] disabled:cursor-not-allowed disabled:opacity-50"
              onClick={onAddFiles}
            >
              <Plus size={14} />
              Add Files
            </RippleButton>
          </>
        ) : null}
      </div>

      <div className="flex items-center gap-2">
        <RippleButton
          type="button"
          className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={onUndo}
          disabled={disabled || !canUndo}
          title="Undo (Ctrl+Z)"
        >
          <RotateCcw size={14} />
          Undo
        </RippleButton>

        <RippleButton
          type="button"
          className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={onRedo}
          disabled={disabled || !canRedo}
          title="Redo (Ctrl+Shift+Z)"
        >
          <RotateCw size={14} />
          Redo
        </RippleButton>

        <RippleButton
          type="button"
          className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={onClear}
          disabled={disabled}
        >
          <Trash2 size={14} />
          Clear All
        </RippleButton>

        <RippleButton
          type="button"
          className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-transparent bg-[#3374f6] px-3 text-xs font-semibold text-white transition hover:bg-[#2f65d7] disabled:cursor-not-allowed disabled:opacity-50"
          onClick={onExport}
          disabled={disabled}
        >
          <Download size={14} />
          Export PDF
        </RippleButton>
      </div>
    </header>
  );
}
