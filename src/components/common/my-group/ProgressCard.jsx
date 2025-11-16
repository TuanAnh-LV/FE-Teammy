import React from "react";
import { Users } from "lucide-react";
import { useTranslation } from "../../../hook/useTranslation";

export default function ProgressCard({ value, text }) {
  const { t } = useTranslation();
  return (
    <div className="rounded-2xl border border-gray-200 bg-white/90 p-6 shadow-md">
      <div className="flex items-center justify-between text-sm font-semibold text-gray-600">
        <p>{text || t("progress") || "Progress"}</p>
        <span className="text-gray-900">{value}%</span>
      </div>
      <div className="mt-3 h-2 rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-blue-500 transition-all"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
