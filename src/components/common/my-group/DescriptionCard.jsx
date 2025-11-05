import React from "react";
import { ClipboardList } from "lucide-react";
import { useTranslation } from "../../../hook/useTranslation";

export default function DescriptionCard({ description }) {
  const { t } = useTranslation();
  return (
    <div className="!bg-white/90 !border !border-gray-200 !rounded-2xl !shadow-md !p-8">
      <div className="!flex !items-center !gap-2 !mb-5">
        <span className="!bg-purple-100 !p-2 !rounded-lg">
          <ClipboardList className="!text-purple-600 !w-5 !h-5" />
        </span>
        <h2 className="!font-bold !text-xl !text-gray-800">{t("description")}</h2>
      </div>
      <p className="!text-gray-700 !leading-relaxed !text-[15px]">{description}</p>
    </div>
  );
}
