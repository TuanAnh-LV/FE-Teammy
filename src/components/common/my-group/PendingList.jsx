import React from "react";
import { Check, X, Hourglass, Clock } from "lucide-react";
import { avatarFromEmail } from "../../../utils/helpers";

export default function PendingList({
  items = [],
  title = "Pending requests",
  onApprove,
  onReject,
  t,
  loading = false,
}) {
  const emptyText =
    t?.("noPendingRequests") || "No pending requests at the moment.";
  const approveLabel = t?.("approve") || "Approve";
  const rejectLabel = t?.("reject") || "Reject";
  const headerTitle = t?.("pendingRequests") || title;
  const singleRequest = t?.("request") || "request";
  const pluralRequests = t?.("requests") || "requests";
  const requestLabel = items.length === 1 ? singleRequest : pluralRequests;

return (
  <div className="bg-white/90 border border-gray-200 rounded-2xl shadow-lg p-5">
    {/* Header */}
    <div className="flex items-center gap-3 mb-4">
      <span className="bg-[#FFF1D6] text-[#FF9F1C] w-10 h-10 rounded-xl flex items-center justify-center">
        <Hourglass className="w-5 h-5" />
      </span>
      <div>
        <p className="text-[13px] font-semibold text-gray-500 uppercase">
          {headerTitle}
        </p>
        <p className="text-lg font-semibold text-gray-900">
          {items.length} {requestLabel}
        </p>
      </div>
    </div>

    {/* Content */}
      {loading ? (
        <div className="!space-y-3">
          {Array.from({ length: 2 }).map((_, idx) => (
            <div
              key={`pending-skeleton-${idx}`}
              className="!flex !flex-col md:!flex-row md:!items-center !gap-4 !border !rounded-2xl !p-4 !bg-white"
            >
              <div className="!flex !items-center !gap-4 !w-full">
                <span className="!w-12 !h-12 !rounded-full !bg-gray-200 !animate-pulse" />
                <div className="!flex-1 !space-y-2">
                  <span className="!block !h-4 !w-32 !bg-gray-200 !rounded-full !animate-pulse" />
                  <span className="!block !h-3 !w-48 !bg-gray-100 !rounded-full !animate-pulse" />
                </div>
              </div>
              <div className="!flex !w-full md:!w-auto !gap-2">
                <span className="!h-8 !w-full md:!w-24 !rounded-full !bg-green-100 !animate-pulse" />
                <span className="!h-8 !w-full md:!w-24 !rounded-full !bg-red-100 !animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
      <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 p-4 rounded-2xl">
        <Clock className="w-4 h-4" />
        {emptyText}
      </div>
    ) : (
      items.map((m, i) => {
        const email = m.email?.trim() || "No email provided";
        const name = m.name?.trim() || "Unknown User";

        return (
          <div
            key={`${email}-${i}`}
            className="flex flex-col md:flex-row md:items-center gap-4 border rounded-2xl p-4 mb-3 bg-white hover:shadow-lg transition overflow-hidden"
          >
            {/* Avatar + Info */}
            <div className="flex items-center gap-4 min-w-0">
              <img
                src={m.avatarUrl || avatarFromEmail(email, 80)}
                alt={name}
                className="w-12 h-12 rounded-full object-cover shadow"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 truncate">{name}</p>
                <p className="text-sm text-gray-600 truncate">{email}</p>
              </div>
            </div>

            {/* Icons only */}
            <div className="flex gap-3 md:ml-auto shrink-0 w-full md:w-auto justify-end">
              <button
                onClick={() => onApprove?.(m)}
                title={approveLabel}
                className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#10B981] hover:bg-[#0D8F6F] text-white shadow-sm transition"
              >
                <Check className="w-5 h-5" />
              </button>
              <button
                onClick={() => onReject?.(m)}
                title={rejectLabel}
                className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#EF4444] hover:bg-[#C03434] text-white shadow-sm transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        );
      })
    )}
  </div>
);


}
