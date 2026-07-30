"use client";

import type { DraftFilePreview } from "@/lib/drafts";

type FilePreviewModalProps = {
  preview: DraftFilePreview | null;
  onClose: () => void;
};

/** Shows the head of a file's extracted text. Exists because a PDF that parsed
 *  into gibberish is otherwise invisible — the upload succeeds, the character
 *  count looks plausible, and every draft is quietly worse. */
export default function FilePreviewModal({
  preview,
  onClose,
}: FilePreviewModalProps) {
  if (!preview) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="max-h-[80vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-card shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-black/5 p-5">
          <div className="min-w-0">
            <div className="truncate text-sm font-bold text-ink">
              {preview.filename}
            </div>
            <div className="text-xs text-ink/50">
              {preview.char_count.toLocaleString()} characters extracted
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg px-3 py-1 text-sm font-semibold text-ink/60 hover:bg-canvas hover:text-ink"
          >
            Close
          </button>
        </div>

        <div className="max-h-[55vh] overflow-y-auto p-5">
          <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-ink/80">
            {preview.excerpt}
          </pre>
          {preview.char_count > preview.excerpt.length && (
            <div className="mt-3 text-xs text-ink/40">
              Showing the first {preview.excerpt.length.toLocaleString()}{" "}
              characters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
