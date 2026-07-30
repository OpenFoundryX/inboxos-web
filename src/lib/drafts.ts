import { apiFetch } from "./api";

/** How readily the user replies. Gates whether a draft is written at all — on
 *  `important_only` the model may decline and no draft is created. */
export type Selectivity = "almost_always" | "when_needed" | "important_only";

export type Tone = "formal" | "friendly" | "concise" | "warm";

export type Length = "short" | "medium" | "long";

/** Where an uploaded file's text lands in the prompt. `instruction` text is
 *  appended to the system prompt; `knowledge` text goes in a reference block the
 *  model may draw facts from. */
export type FilePurpose = "instruction" | "knowledge";

export type DraftSettings = {
  is_enabled: boolean;
  /** `EmailCategory.key` values. An email is only drafted for if its category
   *  is in this list. */
  category_keys: string[];
  selectivity: Selectivity;
  tone: Tone;
  length: Length;
  custom_instructions_enabled: boolean;
  custom_instructions: string | null;
  signature_enabled: boolean;
  signature: string | null;
  follow_up_enabled: boolean;
  follow_up_days: number;
  model: string | null;
  last_sweep_at: string | null;
  last_follow_up_at: string | null;
};

export type DraftSettingsUpdate = Partial<
  Omit<DraftSettings, "last_sweep_at" | "last_follow_up_at">
>;

/** No `extracted_text`: it can be hundreds of kilobytes. Use `previewFile` to
 *  see the head of it. */
export type DraftFile = {
  id: string;
  purpose: FilePurpose;
  filename: string;
  content_type: string;
  size_bytes: number;
  char_count: number;
  is_enabled: boolean;
  created_at: string;
};

export type DraftFilePreview = {
  id: string;
  filename: string;
  char_count: number;
  excerpt: string;
};

/** The mock UI's wording, kept — it describes reply habits in the user's own
 *  terms rather than making them reason about a threshold. */
export const SELECTIVITY_LABELS: Record<Selectivity, string> = {
  almost_always: "I reply to almost everything, even just to be polite",
  when_needed: "I reply when a response is needed",
  important_only: "I only reply to important emails",
};

export const SELECTIVITY_OPTIONS = Object.keys(
  SELECTIVITY_LABELS,
) as Selectivity[];

export const TONE_LABELS: Record<Tone, string> = {
  formal: "Formal",
  friendly: "Friendly",
  concise: "Concise",
  warm: "Warm",
};

export const TONE_HINTS: Record<Tone, string> = {
  formal: "Full sentences, no contractions.",
  friendly: "Warm but professional. Sounds like a person.",
  concise: "Brief and direct. Leads with the answer.",
  warm: "Acknowledges the person before the business.",
};

export const TONE_OPTIONS = Object.keys(TONE_LABELS) as Tone[];

export const LENGTH_LABELS: Record<Length, string> = {
  short: "Short",
  medium: "Medium",
  long: "Long",
};

export const LENGTH_HINTS: Record<Length, string> = {
  short: "Under 60 words",
  medium: "80–150 words",
  long: "150–300 words",
};

export const LENGTH_OPTIONS = Object.keys(LENGTH_LABELS) as Length[];

export const PURPOSE_LABELS: Record<FilePurpose, string> = {
  instruction: "How to write",
  knowledge: "What to say",
};

export const PURPOSE_HINTS: Record<FilePurpose, string> = {
  instruction:
    "Style guides, tone-of-voice docs, rules to follow. Added to the drafting instructions.",
  knowledge:
    "Pricing, FAQs, product details, policies. Facts the draft can draw on when answering.",
};

/** Mirrors `SUPPORTED_EXTS` in `services/drafts/extract.py`. Also served by
 *  `GET /drafts/supported-file-types` so the two cannot drift unnoticed. */
export const SUPPORTED_EXTS = [
  ".pdf",
  ".docx",
  ".txt",
  ".md",
  ".markdown",
  ".text",
  ".csv",
];

/** Server-side limit in `extract.py`. Checked here too so an oversized file is
 *  rejected before it is uploaded rather than after. */
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

/** Shown before the backend answers. Mirrors the column defaults on
 *  `DraftSettings` — drafting is off until explicitly enabled. */
export const DEFAULT_SETTINGS: DraftSettings = {
  is_enabled: false,
  category_keys: ["to_do", "to_follow_up"],
  selectivity: "when_needed",
  tone: "friendly",
  length: "medium",
  custom_instructions_enabled: false,
  custom_instructions: null,
  signature_enabled: true,
  signature: null,
  follow_up_enabled: false,
  follow_up_days: 3,
  model: null,
  last_sweep_at: null,
  last_follow_up_at: null,
};

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const BASE = "/drafts";

export const getSettings = () => apiFetch<DraftSettings>(`${BASE}/settings`);

export const updateSettings = (body: DraftSettingsUpdate) =>
  apiFetch<DraftSettings>(`${BASE}/settings`, {
    method: "PUT",
    body: JSON.stringify(body),
  });

export const listFiles = (purpose?: FilePurpose) =>
  apiFetch<DraftFile[]>(
    purpose ? `${BASE}/files?purpose=${purpose}` : `${BASE}/files`,
  );

/** Multipart, so no JSON body. `apiFetch` omits its Content-Type header for a
 *  FormData body so the browser can set the multipart boundary itself. */
export const uploadFile = (file: File, purpose: FilePurpose) => {
  const form = new FormData();
  form.append("file", file);
  form.append("purpose", purpose);
  return apiFetch<DraftFile>(`${BASE}/files`, { method: "POST", body: form });
};

export const previewFile = (id: string) =>
  apiFetch<DraftFilePreview>(`${BASE}/files/${id}/preview`);

export const updateFile = (
  id: string,
  body: { is_enabled?: boolean; purpose?: FilePurpose },
) =>
  apiFetch<DraftFile>(`${BASE}/files/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });

export const deleteFile = (id: string) =>
  apiFetch<void>(`${BASE}/files/${id}`, { method: "DELETE" });
