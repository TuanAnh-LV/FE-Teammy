import React from "react";
import { X, Mail, Search, Plus } from "lucide-react";

export default function AddMemberModal({ open, onClose, email, setEmail, onAdd, t }) {
  if (!open) return null;
  return (
    <div className="!fixed !inset-0 !bg-black/40 !backdrop-blur-sm !flex !items-center !justify-center !z-50">
      <div className="!bg-white/95 !border !border-gray-200 !shadow-xl !rounded-2xl !p-8 !w-[90%] !max-w-md !relative">
        <button onClick={onClose} className="!absolute !top-4 !right-4 !text-gray-500 hover:!text-black">
          <X className="!w-5 !h-5" />
        </button>

        <h2 className="!font-bold !text-lg !text-gray-800 !mb-4 !flex !items-center !gap-2">
          <Mail className="!w-4 !h-4 !text-gray-600" />
          {t("addMemberByEmail")}
        </h2>

        <div className="!flex !items-center !bg-gray-100 !rounded-lg !px-3 !py-2 !mb-6">
          <Search className="!w-4 !h-4 !text-gray-500 !mr-2" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("enterMemberEmail")}
            className="!bg-transparent !outline-none !w-full !text-gray-700"
          />
        </div>

        <div className="!flex !justify-end !gap-3">
          <button onClick={onClose} className="!px-5 !py-2 !rounded-lg !text-gray-700 hover:!bg-gray-100 !transition">
            {t("cancel")}
          </button>
          <button
            onClick={onAdd}
            className="!flex !items-center !gap-2 !bg-[#404040] !text-white !px-5 !py-2 !rounded-lg !font-semibold hover:!bg-black !transition"
          >
            <Plus className="!w-4 !h-4" /> {t("add")}
          </button>
        </div>
      </div>
    </div>
  );
}
