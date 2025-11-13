import React from "react";

const toneMap = {
  blue: "bg-blue-50 text-blue-700 ring-blue-100",
  green: "bg-green-50 text-green-700 ring-green-100",
  gray: "bg-gray-50 text-gray-700 ring-gray-200",
  red: "bg-red-50 text-red-700 ring-red-100",
  amber: "bg-amber-50 text-amber-700 ring-amber-100",
};

export default function Badge({ children, tone = "blue" }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset ${toneMap[tone]}`}
    >
      {children}
    </span>
  );
}
