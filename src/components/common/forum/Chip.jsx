export function Chip({ children }) {
  return (
    <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset bg-blue-50 text-blue-700 ring-blue-100">
      {children}
    </span>
  );
}

export function StatusChip({ status }) {
  const s = String(status || "").toLowerCase();
  const map = {
    pending: "bg-amber-50 text-amber-700 ring-amber-200",
    accepted: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    rejected: "bg-rose-50 text-rose-700 ring-rose-200",
  };
  const cls = map[s] || "bg-gray-100 text-gray-700 ring-gray-200";
  const label =
    s === "pending"
      ? "Pending"
      : s === "accepted"
      ? "Accepted"
      : s === "rejected"
      ? "Rejected"
      : status || "Applied";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${cls}`}
    >
      {label}
    </span>
  );
}
