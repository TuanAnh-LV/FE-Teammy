import React, { useEffect, useMemo, useState } from "react";
import { Modal } from "antd";
import { Users, Shield } from "lucide-react";
import { GroupService } from "../../../services/group.service";
import { useTranslation } from "../../../hook/useTranslation"; // ✅ đường dẫn từ components/common/forum

const clamp3 = {
  display: "-webkit-box",
  WebkitLineClamp: 3,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
};

function Row({ label, children }) {
  return (
    <div className="flex items-start gap-3">
      <span className="w-28 shrink-0 text-[11px] font-semibold tracking-wide text-gray-500">
        {label}
      </span>
      <div className="text-sm text-gray-800 break-all">{children ?? "—"}</div>
    </div>
  );
}

const GroupDetailModal = ({ isOpen, onClose, groupId }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [group, setGroup] = useState(null);

  useEffect(() => {
    if (!isOpen || !groupId) return;
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await GroupService.getGroupDetail(groupId);
        if (!mounted) return;
        setGroup(res?.data || res);
      } catch {
        setGroup(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [isOpen, groupId]);

  // Title ưu tiên tên nhóm, fallback dùng key "groupInformation"
  const title = useMemo(
    () => group?.name || t("groupInformation") || "Group Detail",
    [group, t]
  );

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      title={<div className="font-bold text-base">{title}</div>}
      width={720}
      destroyOnClose
      styles={{ body: { paddingTop: 12, paddingBottom: 16 } }}
    >
      <div className="max-h-[70vh] overflow-y-auto pr-1">
        {loading ? (
          <div className="space-y-3">
            <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
          </div>
        ) : !group ? (
          <div className="text-sm text-gray-500">
            {t("noData") || "No results found."}
          </div>
        ) : (
          <div className="space-y-5">
            {/* Summary */}
            <div className="rounded-xl border border-gray-200 p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
                {t("description") || "Description"}
              </div>
              <div
                className="text-sm text-gray-700 whitespace-pre-wrap"
                style={clamp3}
                title={group.description || ""}
              >
                {group.description || "—"}
              </div>
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Members */}
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
                  <Users className="h-4 w-4" /> {t("members") || "Members"}
                </div>
                <div className="space-y-2">
                  {/* 3 label dưới chưa có key riêng -> giữ tiếng Anh */}
                  <Row label={t("groupStatus")}>{group.status}</Row>
                  <Row label={t("groupMaxMembers")}>{group.maxMembers}</Row>
                  <Row label={t("groupCurrentMembers")}>
                    {group.currentMembers}
                  </Row>
                </div>
              </div>

              {/* Leader */}
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
                  <Shield className="h-4 w-4" /> {t("leader") || "Leader"}
                </div>
                <div className="space-y-2">
                  <Row label={t("fullName") || "Name"}>
                    {group.leader?.displayName}
                  </Row>
                  <Row label={t("email") || "Email"}>{group.leader?.email}</Row>
                </div>
              </div>
            </div>

            {/* Members list nếu có */}
            {!!group.members?.length && (
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="mb-3 text-sm font-semibold text-gray-800">
                  {(t("members") || "Members") + ` (${group.members.length})`}
                </div>
                <ul className="space-y-2 text-sm">
                  {group.members.map((m) => (
                    <li
                      key={m.userId || m.id}
                      className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2"
                    >
                      <span className="font-medium text-gray-800 break-all">
                        {m.displayName || m.name || "Unknown"}
                      </span>
                      <span className="text-xs text-gray-500">
                        {m.role || m.status || ""}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default GroupDetailModal;
