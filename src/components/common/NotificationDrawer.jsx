import React from "react";
import { X, UserRound, Loader2 } from "lucide-react";
import { useTranslation } from "../../hook/useTranslation";
import { useNavigate } from "react-router-dom";

export default function NotificationDrawer({
  open,
  onClose,      
  items = [],
  onAccept,
  onReject,
  processingNotificationId = null,
  getNotificationId = (n) => n.id,
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  if (!open) return null;

  const handleNotificationClick = (notification) => {
    // Nếu là application, redirect đến trang pending của group
    if (notification.type === "application" && notification.groupId) {
      navigate(`/my-groups?tab=applications&groupId=${notification.groupId}`);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />

      <div className="absolute right-0 top-0 h-full w-[360px] max-w-[92vw] bg-white shadow-2xl border-l border-gray-200 flex flex-col animate-[slideIn_.2s_ease-out]">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-gray-900">{t("notifications") || "Notifications"}</h3>
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
            <div className="text-center text-gray-500 text-sm py-12">{t("noNotifications") || "No notifications"}</div>
          ) : (
            items.map((n) => (
              <div
                key={n.id}
                className={`rounded-xl border border-gray-200 bg-white shadow-sm p-3 ${
                  n.type === "application" ? "cursor-pointer hover:bg-gray-50" : ""
                }`}
                onClick={() => n.type === "application" && handleNotificationClick(n)}
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
                      <p className="text-sm font-medium text-gray-900">
                        {n.title || n.name || t("notifications") || "Notifications"}
                      </p>
                      {n.time && (
                        <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                          {n.time}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 mt-1 break-words">
                      {n.message || t("projectInviteMessage") || "You have a project invitation."}
                    </p>

                    {/* View Details cho application */}
                    {n.type === "application" && (
                      <div className="mt-2">
                        <span className="text-xs text-blue-600 font-medium">
                          {t("clickToView") || "Click to view details"} →
                        </span>
                      </div>
                    )}

                    {/* Accept/Reject actions cho invitations */}
                    {(n.actions?.includes("accept") || n.actions?.includes("reject")) && (
                      <div className="flex items-center gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
                        {n.actions?.includes("reject") && (
                          <button
                            onClick={() => onReject?.(n)}
                            disabled={processingNotificationId === getNotificationId(n)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {processingNotificationId === getNotificationId(n) ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>{t("declining") || "Declining..."}</span>
                              </>
                            ) : (
                              <span>{t("decline") || "Decline"}</span>
                            )}
                          </button>
                        )}
                        {n.actions?.includes("accept") && (
                          <button
                            onClick={() => onAccept?.(n)}
                            disabled={processingNotificationId === getNotificationId(n)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-black text-white hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {processingNotificationId === getNotificationId(n) ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>{t("accepting") || "Accepting..."}</span>
                              </>
                            ) : (
                              <span>{t("accept") || "Accept"}</span>
                            )}
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

      </div>
    </div>
  );
}

