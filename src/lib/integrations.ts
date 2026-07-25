export type Integration = {
  id: string;
  label: string;
  letter: string;
  className: string;
};

// Neutral glyphs (letters + brand-neutral colors) for the onboarding orbit.
// Intentionally NOT real third-party logos.
export const INTEGRATIONS: Integration[] = [
  { id: "mail", label: "Email", letter: "M", className: "bg-accent/15 text-accent" },
  { id: "calendar", label: "Calendar", letter: "C", className: "bg-blue-500/15 text-blue-600" },
  { id: "meet", label: "Meetings", letter: "V", className: "bg-violet-500/15 text-violet-600" },
  { id: "chat", label: "Chat", letter: "S", className: "bg-emerald-500/15 text-emerald-600" },
  { id: "docs", label: "Docs", letter: "D", className: "bg-amber-500/15 text-amber-600" },
  { id: "crm", label: "CRM", letter: "R", className: "bg-rose-500/15 text-rose-600" },
];
