// ── Status labels per media type ────────────────────────────────────────────
export const STATUSES_BY_TYPE: Record<string, { value: string; label: string; color: string; borderColor: string }[]> = {
  book: [
    { value: "reading_list", label: "Reading List", color: "text-amber-400",   borderColor: "border-b-amber-400" },
    { value: "read",         label: "Read",         color: "text-emerald-400", borderColor: "border-b-emerald-500" },
    { value: "reread",       label: "Re-read List", color: "text-sky-400",     borderColor: "border-b-sky-400" },
  ],
  movie: [
    { value: "watch_list",   label: "Watch List",   color: "text-amber-400",   borderColor: "border-b-amber-400" },
    { value: "seen",         label: "Seen",         color: "text-emerald-400", borderColor: "border-b-emerald-500" },
    { value: "rewatch",      label: "Re-watch List",color: "text-sky-400",     borderColor: "border-b-sky-400" },
  ],
  podcast: [
    { value: "listening_list", label: "Listening List", color: "text-amber-400",   borderColor: "border-b-amber-400" },
    { value: "listened",       label: "Listened",       color: "text-emerald-400", borderColor: "border-b-emerald-500" },
    { value: "relisten",       label: "Re-listen List", color: "text-sky-400",     borderColor: "border-b-sky-400" },
  ],
};

export function getStatusesForType(type: string) {
  return STATUSES_BY_TYPE[type] ?? STATUSES_BY_TYPE.book;
}

export function getStatusLabel(type: string, status: string): string {
  return getStatusesForType(type).find(s => s.value === status)?.label ?? status;
}

export function getStatusBorderColor(type: string, status: string): string {
  return getStatusesForType(type).find(s => s.value === status)?.borderColor ?? "border-b-border";
}

export function getStatusColor(type: string, status: string): string {
  return getStatusesForType(type).find(s => s.value === status)?.color ?? "text-muted-foreground";
}

export function defaultStatusForType(type: string): string {
  return getStatusesForType(type)[0].value;
}

// ── Tier ranking system ──────────────────────────────────────────────────────
export const TIERS = [
  { value: "S", label: "S — Life-changing",          bg: "bg-yellow-500/20",  border: "border-yellow-500/40",  text: "text-yellow-400",  badge: "bg-yellow-500" },
  { value: "A", label: "A — Excellent",              bg: "bg-emerald-500/20", border: "border-emerald-500/40", text: "text-emerald-400", badge: "bg-emerald-500" },
  { value: "B", label: "B — Good",                   bg: "bg-sky-500/20",     border: "border-sky-500/40",     text: "text-sky-400",     badge: "bg-sky-500" },
  { value: "C", label: "C — Decent",                 bg: "bg-orange-500/20",  border: "border-orange-500/40",  text: "text-orange-400",  badge: "bg-orange-500" },
  { value: "D", label: "D — What did I just watch",  bg: "bg-red-500/20",     border: "border-red-500/40",     text: "text-red-400",     badge: "bg-red-500" },
] as const;

export type TierValue = "S" | "A" | "B" | "C" | "D" | null;

export function getTier(value: string | null | undefined) {
  return TIERS.find(t => t.value === value) ?? null;
}
