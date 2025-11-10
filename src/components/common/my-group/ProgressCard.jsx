import React from "react";
import { Users } from "lucide-react";
import { useTranslation } from "../../../hook/useTranslation";

export default function ProgressCard({ value, text }) {
  const { t } = useTranslation();
  return (
    <div className="!bg-white/90 !border !border-gray-200 !rounded-2xl !shadow-md !p-8">
      <div className="!flex !items-center !gap-2 !mb-5">
        <span className="!bg-green-100 !p-2 !rounded-lg">
          <Users className="!text-green-600 !w-5 !h-5" />
        </span>
        <h2 className="!font-bold !text-xl !text-gray-800">{t("progress")}</h2>
      </div>
      <div className="!bg-gray-200 !h-3 !rounded-full !overflow-hidden">
        <div className="!bg-green-500 !h-3 !rounded-full" style={{ width: `${value}%` }} />
      </div>
      <p className="!text-sm !text-gray-600 !mt-2">
        {text || t("currentProgress")}: <b>{value}%</b>
      </p>
    </div>
  );
}
