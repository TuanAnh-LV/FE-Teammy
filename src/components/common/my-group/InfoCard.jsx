import React from "react";
import { Info, Calendar } from "lucide-react";
import { useTranslation } from "../../../hook/useTranslation";

export default function InfoCard({ group }) {
  const { t } = useTranslation();
  return (
    <div className="!bg-white/90 !backdrop-blur-md !border !border-gray-200 !rounded-2xl !shadow-md !p-8">
      <div className="!flex !items-center !gap-2 !mb-5">
        <span className="!bg-blue-100 !p-2 !rounded-lg">
          <Info className="!text-blue-600 !w-5 !h-5" />
        </span>
        <h2 className="!font-bold !text-xl !text-gray-800">{t("groupInformation")}</h2>
      </div>

      <h3 className="!font-bold !text-[26px] !text-[#333] !mb-3">{group.title}</h3>

      <div className="!flex !flex-wrap !gap-2 !mb-6">
        {/* <span className="!bg-blue-100 !text-blue-700 !text-sm !font-semibold !px-3 !py-1 !rounded-full">
          {group.field}
        </span> */}
        <span className="!bg-green-100 !text-green-700 !text-sm !font-semibold !px-3 !py-1 !rounded-full">
          {group.statusText}
        </span>
      </div>

      <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-y-3 !text-[15px] !text-gray-700">
        <p><b>ID:</b> {group.id}</p>
        <p><b>{t("mentor")}:</b> {group.mentor}</p>
        <p className="!flex !items-center !gap-2">
          <Calendar className="!w-4 !h-4" /> <b>{t("start")}:</b> {group.start}
        </p>
        <p><b>{t("end")}:</b> {group.end}</p>
        {group.semester && (
          <p><b>{t("semester")}:</b> {group.semester}</p>
        )}
      </div>
    </div>
  );
}
