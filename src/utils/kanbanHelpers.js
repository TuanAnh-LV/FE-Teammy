// src/utils/kanbanHelpers.js

export const tagStyles = {
  Frontend: "bg-blue-100 text-blue-700",
  Backend: "bg-amber-100 text-amber-700",
  Bug: "bg-red-100 text-red-700",
  Design: "bg-purple-100 text-purple-700",
};

export const priorityStyles = {
  High: "bg-red-100 text-red-700",
  Medium: "bg-yellow-100 text-yellow-800",
  Low: "bg-emerald-100 text-emerald-700",
};

export function initials(name = "") {
  return name
    .split(" ")
    .map((w) => w[0]?.toUpperCase())
    .slice(0, 2)
    .join("");
}
