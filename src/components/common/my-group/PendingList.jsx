import React from "react";
import { UserCheck2, UserX2, Hourglass } from "lucide-react";
import { avatarFromEmail } from "../../../utils/helpers";

export default function PendingList({ items = [], title = "Chờ xét duyệt", onApprove, onReject }) {
  return (
    <div className="!bg-white/90 !border !border-gray-200 !rounded-2xl !shadow-md !p-6">
      <h3 className="!font-bold !text-lg !text-gray-800 !mb-4 !flex !items-center !gap-2">
        <span className="!bg-amber-100 !p-2 !rounded-lg">
          <Hourglass className="!text-amber-600 !w-5 !h-5" />
        </span>
        {title}
      </h3>

      {items.length === 0 ? (
        <p className="!text-sm !text-gray-500">Không có yêu cầu mới.</p>
      ) : (
        items.map((m, i) => (
          <div
            key={`${m.email}-${i}`}
            className="!flex !items-center !gap-4 !border !rounded-xl !p-4 !mb-3 !bg-gray-50 hover:!bg-gray-100 !transition"
          >
            <img
              src={m.avatarUrl || avatarFromEmail(m.email, 80)}
              alt={m.name || m.email}
              className="!w-12 !h-12 !rounded-full !object-cover !shadow"
            />
            <div className="!flex-1">
              <p className="!font-semibold !text-gray-800">{m.name || "Người dùng"}</p>
              <p className="!text-sm !text-gray-600">{m.email}</p>
            </div>

            <div className="!flex !items-center !gap-2">
              <button
                onClick={() => onApprove?.(m)}
                className="!inline-flex !items-center !gap-1 !px-3 !py-2 !rounded-lg !text-white !bg-green-600 hover:!bg-green-700 !transition"
                title="Duyệt"
              >
                <UserCheck2 className="!w-4 !h-4" />
                Duyệt
              </button>
              <button
                onClick={() => onReject?.(m)}
                className="!inline-flex !items-center !gap-1 !px-3 !py-2 !rounded-lg !text-white !bg-red-600 hover:!bg-red-700 !transition"
                title="Từ chối"
              >
                <UserX2 className="!w-4 !h-4" />
                Từ chối
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
