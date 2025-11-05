import React from "react";
import { UserPlus2, FolderKanban } from "lucide-react";
import { useTranslation } from "../../../hook/useTranslation";

export default function HeaderBar({ onOpenAdd, onOpenWorkspace }) {
  const { t } = useTranslation();
  return (
    <div className="!flex !gap-3">
      <button
        onClick={onOpenAdd}
        className="!bg-[#4264d7] !text-white !px-5 !py-2.5 !rounded-lg !font-semibold !shadow-md hover:!bg-black hover:!scale-[1.02] !transition-all !flex !items-center !gap-2"
      >
        <UserPlus2 className="!w-4 !h-4" />
        {t("addMember")}
      </button>

      <button
        onClick={onOpenWorkspace}
        className="!bg-[#4264d7] !text-white !px-5 !py-2.5 !rounded-lg !font-semibold !shadow-md hover:!bg-black hover:!scale-[1.02] !transition-all !flex !items-center !gap-2"
      >
        <FolderKanban className="!w-4 !h-4" />
        {t("openWorkspace")}
      </button>
    </div>
  );
}
