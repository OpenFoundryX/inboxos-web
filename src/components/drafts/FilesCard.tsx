"use client";

import { useRef, useState } from "react";
import Card from "@/components/ui/Card";
import Toggle from "@/components/ui/Toggle";
import {
  MAX_UPLOAD_BYTES,
  PURPOSE_HINTS,
  PURPOSE_LABELS,
  SUPPORTED_EXTS,
  formatBytes,
  type DraftFile,
  type FilePurpose,
} from "@/lib/drafts";

type FilesCardProps = {
  purpose: FilePurpose;
  files: DraftFile[];
  onUpload: (file: File) => Promise<void>;
  onToggle: (id: string, isEnabled: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onPreview: (id: string) => Promise<void>;
  busy?: boolean;
};

export default function FilesCard({
  purpose,
  files,
  onUpload,
  onToggle,
  onDelete,
  onPreview,
  busy,
}: FilesCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  /** Rejects what we can judge without a round trip. The server checks the same
   *  limits — this only saves the user a pointless 10 MB upload. */
  function precheck(file: File): string | null {
    const dot = file.name.lastIndexOf(".");
    const ext = dot >= 0 ? file.name.slice(dot).toLowerCase() : "";
    if (!SUPPORTED_EXTS.includes(ext)) {
      return `${file.name} isn't a supported file type. Use ${SUPPORTED_EXTS.join(", ")}.`;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      return `${file.name} is ${formatBytes(file.size)} — the limit is ${formatBytes(MAX_UPLOAD_BYTES)}.`;
    }
    return null;
  }

  async function handleFiles(selected: FileList | null) {
    if (!selected?.length) return;
    setLocalError(null);
    for (const file of Array.from(selected)) {
      const problem = precheck(file);
      if (problem) {
        setLocalError(problem);
        continue;
      }
      await onUpload(file);
    }
    // Clear the input so re-picking the same file fires onChange again.
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <Card className="p-5">
      <div className="mb-1 text-sm font-bold text-ink">
        {PURPOSE_LABELS[purpose]}
      </div>
      <div className="mb-4 text-xs text-ink/50">{PURPOSE_HINTS[purpose]}</div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (!busy) void handleFiles(e.dataTransfer.files);
        }}
        onClick={() => !busy && inputRef.current?.click()}
        className={`cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
          dragging ? "border-ink/40 bg-canvas" : "border-black/10"
        } ${busy ? "cursor-not-allowed opacity-60" : "hover:border-ink/25"}`}
      >
        <div className="text-sm font-medium text-ink">
          {busy ? "Uploading…" : "Drop a file here, or click to choose"}
        </div>
        <div className="mt-1 text-xs text-ink/40">
          {SUPPORTED_EXTS.join(", ")} · up to {formatBytes(MAX_UPLOAD_BYTES)}
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={SUPPORTED_EXTS.join(",")}
          className="hidden"
          onChange={(e) => void handleFiles(e.target.files)}
        />
      </div>

      <div className="mt-2 text-xs text-ink/40">
        We read the text out of the file and keep only that — the original
        isn&apos;t stored, so there&apos;s nothing to download later.
      </div>

      {localError && (
        <div className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-800">
          {localError}
        </div>
      )}

      {files.length > 0 && (
        <ul className="mt-4 divide-y divide-black/5">
          {files.map((file) => (
            <li
              key={file.id}
              className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
            >
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-ink">
                  {file.filename}
                </div>
                <div className="text-xs text-ink/40">
                  {formatBytes(file.size_bytes)} ·{" "}
                  {file.char_count.toLocaleString()} characters of text
                </div>
              </div>
              <button
                type="button"
                onClick={() => void onPreview(file.id)}
                className="shrink-0 text-xs font-semibold text-ink/60 underline hover:text-ink"
              >
                Preview
              </button>
              <Toggle
                checked={file.is_enabled}
                disabled={busy}
                label={`Use ${file.filename}`}
                onChange={(v) => void onToggle(file.id, v)}
              />
              <button
                type="button"
                disabled={busy}
                onClick={() => void onDelete(file.id)}
                aria-label={`Delete ${file.filename}`}
                className="shrink-0 rounded-lg px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
