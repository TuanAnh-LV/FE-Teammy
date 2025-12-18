import { useCallback, useEffect, useRef, useState } from "react";
import { Modal, notification } from "antd";
import { GroupService } from "../services/group.service";
import { BoardService } from "../services/board.service";
import { SkillService } from "../services/skill.service";
import { ReportService } from "../services/report.service";


export const useGroupDetail = ({ groupId, t, userInfo }) => {
  const [group, setGroup] = useState(null);
  const [groupMembers, setGroupMembers] = useState([]);
  const [groupSkillsWithRole, setGroupSkillsWithRole] = useState([]);
  const [groupFiles, setGroupFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadedGroupIdRef = useRef(null);

  const fetchCompletionPercent = useCallback(async () => {
    if (!groupId) return;
    try {
      const res = await ReportService.getProjectReport(groupId);
      const completionPercent = res?.data?.project?.completionPercent ?? 0;
      setGroup((prev) =>
        prev ? { ...prev, progress: completionPercent } : prev
      );
    } catch {
      notification.error({
        message: t("error") || "Error",
        description:
          t("failedToFetchProgress") || "Failed to fetch project progress.",
      });
    }
  }, [groupId, t]);

  const fetchGroupDetail = useCallback(async () => {
    if (!groupId) return;
    if (loadedGroupIdRef.current === groupId) return;

    loadedGroupIdRef.current = groupId;

    try {
      setLoading(true);

      const [detailRes, membersRes, reportRes] = await Promise.allSettled([
        GroupService.getGroupDetail(groupId),
        GroupService.getListMembers(groupId),
        ReportService.getProjectReport(groupId),
      ]);

      const d = detailRes.status === "fulfilled" ? detailRes.value.data : {};

      const semesterInfo = d.semester || {};
      const rawStartDate = semesterInfo.startDate || d.startDate;
      const rawEndDate = semesterInfo.endDate || d.endDate;

      const season =
        typeof semesterInfo.season === "string"
          ? semesterInfo.season.trim()
          : semesterInfo.season
          ? String(semesterInfo.season)
          : "";

      const formattedSeason = season
        ? season.charAt(0).toUpperCase() + season.slice(1)
        : "";

      const semesterLabel = [formattedSeason, semesterInfo.year]
        .filter(Boolean)
        .join(" ");

      const members =
        membersRes.status === "fulfilled" &&
        Array.isArray(membersRes.value?.data)
          ? membersRes.value.data
          : [];

      const normalizedMembers = members.map((m) => {
        const email = m.email || "";
        const normalizedEmail = email.toLowerCase();
        const currentEmail = (userInfo?.email || "").toLowerCase();

        const avatarFromApi =
          m.avatarUrl ||
          m.avatarURL ||
          m.avatar_url ||
          m.avatar ||
          m.imageUrl ||
          m.imageURL ||
          m.image_url ||
          m.photoURL ||
          m.photoUrl ||
          m.photo_url ||
          m.profileImage ||
          m.user?.avatarUrl ||
          m.user?.avatar ||
          m.user?.photoURL ||
          m.user?.photoUrl ||
          m.user?.imageUrl ||
          m.user?.profileImage ||
          "";

        const memberId =
          m.id || m.memberId || m.userId || m.userID || m.accountId || "";

        return {
          id: memberId,
          name: m.displayName || m.name || "",
          email,
          role: m.role || m.status || "",
          joinedAt: m.joinedAt,
          avatarUrl:
            avatarFromApi ||
            (currentEmail && normalizedEmail === currentEmail
              ? userInfo?.photoURL || ""
              : ""),
          assignedRoles: m.assignedRoles || [],
        };
      });

      const currentEmail = (userInfo?.email || "").toLowerCase();
      const detailRole = (d.role || "").toLowerCase();
      const leaderFromMembers = normalizedMembers.some(
        (member) =>
          (member.email || "").toLowerCase() === currentEmail &&
          (member.role || "").toLowerCase() === "leader"
      );

      const completionPercent =
        reportRes.status === "fulfilled"
          ? reportRes.value?.data?.project?.completionPercent ?? 0
          : 0;

      setGroup({
        id: d.id || groupId,
        title: d.name || "",
        field:
          d.field ||
          d.major?.name ||
          d.major?.majorName ||
          (typeof d.major === "string" ? d.major : "") ||
          "",
        description: d.description || "",
        start: rawStartDate ? rawStartDate.slice(0, 10) : "",
        end: rawEndDate ? rawEndDate.slice(0, 10) : "",
        semester: semesterLabel,
        progress: completionPercent,
        mentor: d.mentor,
        status: d.status || "",
        statusText: d.status || "",
        maxMembers: Number(d.maxMembers || d.capacity || 5),
        majorId:
          d.majorId || d.major?.id || d.major?.majorId || d.majorID || "",
        topicId: d.topicId || d.topic?.topicId || d.topic?.id || "",
        topicName: d.topicName || d.topic?.title || d.topic?.name || "",
        skills: Array.isArray(d.skills)
          ? d.skills
          : typeof d.skills === "string" && d.skills
          ? d.skills
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
        canEdit: detailRole === "leader" || leaderFromMembers,
      });

      setGroupMembers(normalizedMembers);

      if (d.skills && d.skills.length > 0) {
        try {
          const skillsResponse = await SkillService.list({});
          const allSkills = Array.isArray(skillsResponse?.data)
            ? skillsResponse.data
            : [];
          const groupSkillTokens = Array.isArray(d.skills) ? d.skills : [];
          const matchedSkills = allSkills.filter((s) =>
            groupSkillTokens.includes(s.token)
          );
          setGroupSkillsWithRole(matchedSkills);
        } catch {
          setGroupSkillsWithRole([]);
        }
      } else {
        setGroupSkillsWithRole([]);
      }
    } catch {
      notification.error({
        message: t("error") || "Error",
        description:
          t("failedToLoadGroupData") || "Failed to load group data.",
      });
    } finally {
      setLoading(false);
    }
  }, [groupId, t, userInfo]);

  useEffect(() => {
    fetchGroupDetail();
  }, [fetchGroupDetail]);

  const loadGroupFiles = useCallback(async () => {
    if (!groupId) return;
    try {
      const res = await BoardService.getGroupFiles(groupId);
      const list = Array.isArray(res?.data) ? res.data : res?.items || [];
      setGroupFiles(list);
    } catch {
      notification.error({
        message: t("error") || "Error",
        description:
          t("failedToLoadGroupFiles") || "Failed to load group files.",
      });
      setGroupFiles([]);
    }
  }, [groupId, t]);

  const handleKickMember = useCallback(
    async (memberId, memberName) => {
      if (!groupId || !memberId) return;

      const confirmed = window.confirm(
        t("confirmKickMember") ||
          `Are you sure you want to remove ${memberName} from the group?`
      );

      if (!confirmed) return;

      try {
        await GroupService.kickMember(groupId, memberId);

        notification.success({
          message: t("success") || "Success",
          description:
            t("memberRemovedSuccessfully") || "Member removed successfully.",
        });

        const membersRes = await GroupService.getListMembers(groupId);
        const members = Array.isArray(membersRes?.data)
          ? membersRes.data
          : [];

        const normalizedMembers = members.map((m) => {
          const email = m.email || "";
          const normalizedEmail = email.toLowerCase();
          const currentEmail = (userInfo?.email || "").toLowerCase();

          const avatarFromApi =
            m.avatarUrl ||
            m.avatarURL ||
            m.avatar_url ||
            m.avatar ||
            m.imageUrl ||
            m.imageURL ||
            m.image_url ||
            m.photoURL ||
            m.photoUrl ||
            m.photo_url ||
            m.profileImage ||
            m.user?.avatarUrl ||
            m.user?.avatar ||
            m.user?.photoURL ||
            m.user?.photoUrl ||
            m.user?.imageUrl ||
            m.user?.profileImage ||
            "";

          const memberIdValue =
            m.id || m.memberId || m.userId || m.userID || m.accountId || "";

          return {
            id: memberIdValue,
            name: m.displayName || m.name || "",
            email,
            role: m.role || m.status || "",
            joinedAt: m.joinedAt,
            avatarUrl:
              avatarFromApi ||
              (currentEmail && normalizedEmail === currentEmail
                ? userInfo?.photoURL || ""
                : ""),
          };
        });

        setGroupMembers(normalizedMembers);
      } catch {
        notification.error({
          message: t("error") || "Error",
          description: t("failedToRemoveMember") || "Failed to remove member.",
        });
      }
    },
    [groupId, t, userInfo]
  );

  const handleAssignRole = useCallback(
    async (memberId, roleName) => {
      if (!groupId || !memberId || !roleName) return;

      try {
        await GroupService.assignMemberRole(groupId, memberId, roleName);

        notification.success({
          message: t("success") || "Success",
          description:
            t("roleAssignedSuccessfully") || "Role assigned successfully.",
        });

        const membersRes = await GroupService.getListMembers(groupId);
        const members = Array.isArray(membersRes?.data)
          ? membersRes.data
          : [];

        const normalizedMembers = members.map((m) => {
          const email = m.email || "";
          const normalizedEmail = email.toLowerCase();
          const currentEmail = (userInfo?.email || "").toLowerCase();

          const avatarFromApi =
            m.avatarUrl ||
            m.avatarURL ||
            m.avatar_url ||
            m.avatar ||
            m.imageUrl ||
            m.imageURL ||
            m.image_url ||
            m.photoURL ||
            m.photoUrl ||
            m.photo_url ||
            m.profileImage ||
            m.user?.avatarUrl ||
            m.user?.avatar ||
            m.user?.photoURL ||
            m.user?.photoUrl ||
            m.user?.imageUrl ||
            m.user?.profileImage ||
            "";

          const memberIdValue =
            m.id || m.memberId || m.userId || m.userID || m.accountId || "";

          return {
            id: memberIdValue,
            name: m.displayName || m.name || "",
            email,
            role: m.role || m.status || "",
            joinedAt: m.joinedAt,
            avatarUrl:
              avatarFromApi ||
              (currentEmail && normalizedEmail === currentEmail
                ? userInfo?.photoURL || ""
                : ""),
          };
        });

        setGroupMembers(normalizedMembers);
      } catch (err) {
        notification.error({
          message: t("error") || "Error",
          description: t("failedToAssignRole") || "Failed to assign role.",
        });
        throw err;
      }
    },
    [groupId, t, userInfo]
  );

  const handleTransferLeader = useCallback(
    (member) => {
      if (!groupId || !member) return;

      const memberId =
        member.id ||
        member.userId ||
        member.userID ||
        member.memberId ||
        member.accountId;
      const memberName = member.name || member.displayName || member.email;

      Modal.confirm({
        title: t("confirmChangeLeader") || "Change Leader",
        content: `${t("confirmChangeLeaderMessage") ||
          "Are you sure you want to transfer leadership to"} ${memberName}?`,
        okText: t("confirm") || "Confirm",
        cancelText: t("cancel") || "Cancel",
        okButtonProps: { type: "primary" },
        onOk: async () => {
          try {
            await GroupService.transferLeader(groupId, memberId);
            notification.success({
              message:
                t("leadershipTransferred") || "Leadership transferred",
              description: `${memberName} ${t("isNowTheLeader") ||
                "is now the leader"}`,
            });

            try {
              await fetchGroupDetail();
            } catch (fetchError) {
              // eslint-disable-next-line no-console
              console.error(
                "Failed to refresh group details:",
                fetchError
              );
            }
          } catch (error) {
            notification.error({
              message:
                t("failedToTransferLeader") ||
                "Failed to transfer leadership",
              description:
                error?.response?.data?.message ||
                error?.message ||
                t("pleaseTryAgain") ||
                "Please try again.",
            });
          }
        },
      });
    },
    [groupId, t, fetchGroupDetail]
  );

  return {
    group,
    setGroup,
    groupMembers,
    setGroupMembers,
    groupSkillsWithRole,
    groupFiles,
    loading,
    loadGroupFiles,
    fetchCompletionPercent,
    handleKickMember,
    handleAssignRole,
    handleTransferLeader,
    fetchGroupDetail,
  };
};


