import React from "react";
import { X, UserRound } from "lucide-react";

export default function NotificationDrawer({
  open,
  onClose,
  items = [],
  onAccept,
  onReject,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />

      <div className="absolute right-0 top-0 h-full w-[360px] max-w-[92vw] bg-white shadow-2xl border-l border-gray-200 flex flex-col animate-[slideIn_.2s_ease-out]">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-gray-900">Thông báo</h3>
            {items?.length ? (
              <span className="ml-1 inline-flex items-center justify-center text-xs font-bold text-white bg-red-500 rounded-full w-5 h-5">
                {items.length}
              </span>
            ) : null}
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-black">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {items?.length === 0 ? (
            <div className="text-center text-gray-500 text-sm py-12">Không có thông báo</div>
          ) : (
            items.map((n) => (
              <div
                key={n.id}
                className="rounded-xl border border-gray-200 bg-white shadow-sm p-3"
              >
                <div className="flex items-start gap-3">
                  {n.avatarUrl ? (
                    <img
                      src={n.avatarUrl}
                      alt={n.name || ""}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-green-500/20 text-green-700 flex items-center justify-center">
                      <UserRound className="w-5 h-5" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {n.title || n.name || "Thông báo"}
                      </p>
                      {n.time && (
                        <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                          {n.time}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 mt-1">
                      {n.message || "Bạn có một lời mời tham gia dự án."}
                    </p>

                    {(n.actions?.includes("accept") || n.actions?.includes("reject")) && (
                      <div className="flex items-center gap-2 mt-3">
                        {n.actions?.includes("reject") && (
                          <button
                            onClick={() => onReject?.(n)}
                            className="px-3 py-1.5 rounded-full text-sm border border-gray-300 text-gray-700 hover:bg-gray-100"
                          >
                            Từ chối
                          </button>
                        )}
                        {n.actions?.includes("accept") && (
                          <button
                            onClick={() => onAccept?.(n)}
                            className="px-3 py-1.5 rounded-full text-sm bg-black text-white hover:bg-gray-900"
                          >
                            Chấp nhận
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="px-4 py-3 border-t border-gray-100 text-center">
          <button
            onClick={onClose}
            className="text-blue-600 font-medium hover:underline"
          >
            ĐÓNG
          </button>
        </div>
      </div>
    </div>
  );
}

// Tailwind keyframes (if not already defined globally)
// .animate-[slideIn_.2s_ease-out] relies on keyframes named slideIn.
// Many setups allow arbitrary animations; if not, the panel still renders without animation.

