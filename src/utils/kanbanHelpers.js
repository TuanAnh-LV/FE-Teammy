// src/utils/kanbanHelpers.js

export const tagStyles = {
  Frontend: "bg-blue-100 text-blue-700",
  Backend: "bg-amber-100 text-amber-700",
  Bug: "bg-red-100 text-red-700",
  Design: "bg-purple-100 text-purple-700",
};

export const priorityStyles = {
  high: "bg-red-100 text-red-700",
  medium: "bg-yellow-100 text-yellow-800",
  low: "bg-emerald-100 text-emerald-700",
  High: "bg-red-100 text-red-700",
  Medium: "bg-yellow-100 text-yellow-800",
  Low: "bg-emerald-100 text-emerald-700",
};

export const statusStyles = {
  todo: "bg-gray-100 text-gray-700",
  in_progress: "bg-blue-100 text-blue-700",
  review: "bg-amber-100 text-amber-700",
  blocked: "bg-red-100 text-red-700",
  done: "bg-emerald-100 text-emerald-700",
};

export function initials(value = "") {
  const name =
    typeof value === "string"
      ? value
      : value?.name ||
        value?.displayName ||
        value?.fullName ||
        value?.email ||
        value?.id ||
        "";
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}
