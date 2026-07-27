import { apiFetch } from "./api";

/** Gmail side effects applied alongside a category's label. Archive and
 *  skip-inbox are the same Gmail mutation, so there are three, not four. */
export type CategoryActions = {
  archive: boolean;
  mark_read: boolean;
  star: boolean;
};

export type Category = {
  /** Immutable. Rules and the fallback setting reference this. */
  key: string;
  /** Immutable — Gmail has no rename-label action, so this is fixed at creation. */
  gmail_label: string;
  display_name: string;
  description: string;
  color_bg: string;
  color_text: string;
  is_builtin: boolean;
  is_enabled: boolean;
  sort_order: number;
  actions: CategoryActions;
};

export type CategoryCreate = {
  display_name: string;
  description: string;
  color_bg?: string;
  color_text?: string;
  sort_order?: number;
  actions?: CategoryActions;
};

/** `key` and `gmail_label` are deliberately absent — they cannot be changed. */
export type CategoryUpdate = Partial<
  Pick<
    Category,
    | "display_name"
    | "description"
    | "color_bg"
    | "color_text"
    | "is_enabled"
    | "sort_order"
  >
> & { actions?: Partial<CategoryActions> };

export type MatchType =
  | "sender_address"
  | "sender_domain"
  | "subject_keyword"
  | "body_keyword";

export type RuleAction = "assign" | "exclude";

export type Rule = {
  id: string;
  is_enabled: boolean;
  /** Lower runs first; first match wins. */
  priority: number;
  match_type: MatchType;
  match_value: string;
  action: RuleAction;
  category_key: string | null;
};

export type RuleCreate = {
  match_type: MatchType;
  match_value: string;
  action?: RuleAction;
  category_key?: string | null;
  is_enabled?: boolean;
};

export type RuleUpdate = Partial<Omit<Rule, "id">>;

export type CategorizationSettings = {
  is_enabled: boolean;
  fallback_category_key: string | null;
  confidence_threshold: number;
  model: string | null;
  extra_instructions: string | null;
  last_reclassify_at: string | null;
};

export type SettingsUpdate = Partial<
  Omit<CategorizationSettings, "last_reclassify_at">
>;

export type ReclassifyResponse = {
  task_id: string;
  days: number;
  max_results: number | null;
};

export const MATCH_TYPE_LABELS: Record<MatchType, string> = {
  sender_address: "Sender address",
  sender_domain: "Sender domain",
  subject_keyword: "Subject contains",
  body_keyword: "Preview contains",
};

/** The backend matches this against the message snippet, not the full body —
 *  the Gmail trigger payload carries only a preview and is never re-fetched. */
export const BODY_KEYWORD_NOTE =
  "Matches the preview text Gmail sends us, not the full message body.";

export const MATCH_TYPES = Object.keys(MATCH_TYPE_LABELS) as MatchType[];

export const CLASSIFIER_MODELS = ["gpt-4o-mini", "gpt-4o"];

/** Shown before the backend answers, and in mock mode when no API is configured.
 *  Mirrors BUILTIN_CATEGORIES on the server. */
export const DEFAULT_CATEGORIES: Category[] = [
  {
    key: "to_do",
    gmail_label: "to do",
    display_name: "To do",
    description:
      "Needs an action or reply from me; a real request, task, or question directed at me.",
    color_bg: "#fb4c2f",
    color_text: "#ffffff",
    is_builtin: true,
    is_enabled: true,
    sort_order: 0,
    actions: { archive: false, mark_read: false, star: false },
  },
  {
    key: "to_follow_up",
    gmail_label: "to follow up",
    display_name: "To follow up",
    description:
      "A thread I'm waiting on or should chase; awaiting someone's reply, or a nudge I must track.",
    color_bg: "#a479e2",
    color_text: "#ffffff",
    is_builtin: true,
    is_enabled: true,
    sort_order: 1,
    actions: { archive: false, mark_read: false, star: false },
  },
  {
    key: "notification",
    gmail_label: "notification",
    display_name: "Notification",
    description:
      "Automated transactional notice: receipts, confirmations, alerts, security codes, system messages.",
    color_bg: "#4a86e8",
    color_text: "#ffffff",
    is_builtin: true,
    is_enabled: true,
    sort_order: 2,
    actions: { archive: false, mark_read: false, star: false },
  },
  {
    key: "fyi",
    gmail_label: "fyi",
    display_name: "FYI",
    description:
      "Informational and relevant, from a person or team, but needs no action from me.",
    color_bg: "#16a766",
    color_text: "#ffffff",
    is_builtin: true,
    is_enabled: true,
    sort_order: 3,
    actions: { archive: false, mark_read: false, star: false },
  },
  {
    key: "marketing",
    gmail_label: "marketing",
    display_name: "Marketing",
    description:
      "Promotional or sales: newsletters, product offers, campaigns, cold pitches.",
    color_bg: "#fad165",
    color_text: "#000000",
    is_builtin: true,
    is_enabled: true,
    sort_order: 4,
    actions: { archive: false, mark_read: false, star: false },
  },
  {
    key: "noise",
    gmail_label: "noise",
    display_name: "Noise",
    description:
      "Low-value bulk or social clutter; spam-like, unimportant, safe to ignore.",
    color_bg: "#999999",
    color_text: "#ffffff",
    is_builtin: true,
    is_enabled: true,
    sort_order: 5,
    actions: { archive: false, mark_read: false, star: false },
  },
];

export const DEFAULT_SETTINGS: CategorizationSettings = {
  is_enabled: true,
  fallback_category_key: null,
  confidence_threshold: 0,
  model: null,
  extra_instructions: null,
  last_reclassify_at: null,
};

const BASE = "/categorization";

export const listCategories = () => apiFetch<Category[]>(`${BASE}/categories`);

export const createCategory = (body: CategoryCreate) =>
  apiFetch<Category>(`${BASE}/categories`, {
    method: "POST",
    body: JSON.stringify(body),
  });

export const updateCategory = (key: string, body: CategoryUpdate) =>
  apiFetch<Category>(`${BASE}/categories/${encodeURIComponent(key)}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });

export const deleteCategory = (key: string) =>
  apiFetch<void>(`${BASE}/categories/${encodeURIComponent(key)}`, {
    method: "DELETE",
  });

export const listRules = () => apiFetch<Rule[]>(`${BASE}/rules`);

export const createRule = (body: RuleCreate) =>
  apiFetch<Rule>(`${BASE}/rules`, { method: "POST", body: JSON.stringify(body) });

export const updateRule = (id: string, body: RuleUpdate) =>
  apiFetch<Rule>(`${BASE}/rules/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });

export const deleteRule = (id: string) =>
  apiFetch<void>(`${BASE}/rules/${id}`, { method: "DELETE" });

/** Must list every one of the user's rules exactly once. */
export const reorderRules = (ruleIds: string[]) =>
  apiFetch<Rule[]>(`${BASE}/rules/order`, {
    method: "PUT",
    body: JSON.stringify({ rule_ids: ruleIds }),
  });

export const getSettings = () =>
  apiFetch<CategorizationSettings>(`${BASE}/settings`);

export const updateSettings = (body: SettingsUpdate) =>
  apiFetch<CategorizationSettings>(`${BASE}/settings`, {
    method: "PUT",
    body: JSON.stringify(body),
  });

export const reclassify = (days = 7, maxResults?: number) =>
  apiFetch<ReclassifyResponse>(`${BASE}/reclassify`, {
    method: "POST",
    body: JSON.stringify({ days, max_results: maxResults ?? null }),
  });
