import { useCallback, useMemo } from "react";
import { Modal, notification } from "antd";
import { GroupService } from "../services/group.service";

export const useGroupActivation = ({ group, groupMembers, t, id, setGroup }) => {
  const canActivateGroup = useMemo(() => {
    if (!group) return false;
    const status = String(group.status || "").toLowerCase();
    return Boolean(group.canEdit) && status !== "active" && status !== "closed";
  }, [group]);

  const handleActivateGroup = useCallback(() => {
    if (!group || !canActivateGroup) return;

    const mentors = Array.isArray(group?.mentors) ? group.mentors : [];
    const hasMentor = mentors.length > 0;

    // FE guard: must have topic + mentor before calling API
    if (!group.topicId || !hasMentor) {
      notification.info({
        message: t("cannotActivateGroup") || "Cannot activate group",
        description:
          t("groupMustSelectTopicAndMentor") ||
          "Group must select a topic and mentor before confirming.",
        placement: "topRight",
        duration: 5,
      });
      return;
    }

    Modal.confirm({
      title: t("confirmActivateGroup") || "Confirm activate group?",
      content:
        t("confirmActivateGroupMessage") ||
        "Once activated, your group will be locked for this semester. Do you want to continue?",
      okText: t("confirm") || "Confirm",
      cancelText: t("cancel") || "Cancel",
      okButtonProps: { type: "primary" },
      onOk: async () => {
        try {
          await GroupService.activateGroup(id || group.id);
          notification.success({
            message: t("groupActivated") || "Group activated successfully",
            placement: "topRight",
          });
          setGroup((prev) =>
            prev
              ? {
                  ...prev,
                  status: "active",
                  statusText: "active",
                }
              : prev
          );
        } catch (error) {
          const statusCode = error?.response?.status;
          const rawMessage =
            typeof error?.response?.data === "string"
              ? error.response.data
              : error?.response?.data?.message || "";
          const serverMessage = String(rawMessage || "").toLowerCase();

          if (statusCode === 409) {
            if (serverMessage.includes("member")) {
              notification.info({
                message:
                  t("groupNotEnoughMembersToActivateTitle") ||
                  (groupMembers?.length
                    ? "Group is not full enough to activate"
                    : "Not enough members to activate"),
                description:
                  rawMessage ||
                  t("groupNotEnoughMembersToActivateDesc") ||
                  "Please add more members before activating this group.",
                placement: "topRight",
                duration: 6,
              });
            } else {
              notification.info({
                message: t("cannotActivateGroup") || "Cannot activate group",
                description:
                  rawMessage ||
                  t("groupMustSelectTopicAndMentor") ||
                  "Group must select a topic and mentor before confirming.",
                placement: "topRight",
                duration: 6,
              });
            }
          } else {
            notification.info({
              message: t("error") || "Error",
              description:
                rawMessage ||
                t("failedToActivateGroup") ||
                "Failed to activate group. Please try again.",
              placement: "topRight",
              duration: 5,
            });
          }
        }
      },
    });
  }, [group, canActivateGroup, t, id, setGroup, groupMembers]);

  return { canActivateGroup, handleActivateGroup };
};



