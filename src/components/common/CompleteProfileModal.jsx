import React, { useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, Plus, CheckCircle } from "lucide-react";
import { notification, Tag, Alert, Modal } from "antd";
import { UserService } from "../../services/user.service";
import { MajorService } from "../../services/major.service";
import { SkillService } from "../../services/skill.service";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "../../hook/useTranslation";
import {
  ALL_ROLES,
  ROLE_COLORS,
  ROLE_BUTTON_STYLES,
  inferPrimaryRoleFromPositionName,
  normalizeSkillTokens,
  uniq,
  countSkillsByRole,
} from "../../utils/roleHelpers";

const MIN_PRIMARY_SKILLS = 2;
const MAX_SECONDARY_ROLES_WARNING_THRESHOLD = 2;
const CompleteProfileModal = ({ isOpen, profileData, onComplete, onClose }) => {
  const { role } = useAuth();
  const { t } = useTranslation();

  const roleNormalized = role?.toLowerCase();
  const isStaffRole = ["admin", "moderator", "mentor"].includes(roleNormalized);
  const isStudent = !isStaffRole;

  const [formData, setFormData] = useState({
    displayName: "",
    phone: "",
    gender: "",
    majorId: "",
    desiredPositionId: "",
    skills: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [majors, setMajors] = useState([]);
  const [positions, setPositions] = useState([]);
  const [isLoadingPositions, setIsLoadingPositions] = useState(false);

  const [availableSkills, setAvailableSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);

  // NEW: primaryRole + enabledRoles toggle
  const [primaryRole, setPrimaryRole] = useState("all");
  const [enabledRoles, setEnabledRoles] = useState(["all"]); // ["all"] => không khóa
  const [skillFilter, setSkillFilter] = useState("all"); // "all" => all-within-enabledRoles

  const [errors, setErrors] = useState({});

  const pruneWarnKeyRef = useRef("");
  const fallbackWarnKeyRef = useRef("");

  const rolesInSkills = useMemo(() => {
    return new Set(availableSkills.map((s) => s.role).filter(Boolean));
  }, [availableSkills]);
  const [tooManyRolesWarning, setTooManyRolesWarning] = useState("");
  const [roleToggleWarning, setRoleToggleWarning] = useState("");
  const [skillNotAllowedWarning, setSkillNotAllowedWarning] = useState("");
  const [primarySkillsAlert, setPrimarySkillsAlert] = useState("");

  // init from profileData
  useEffect(() => {
    if (!profileData) return;
    const skillTokens = normalizeSkillTokens(profileData.skills);

    setFormData({
      displayName: profileData.displayName || "",
      phone: profileData.phone || "",
      gender: profileData.gender || "",
      majorId: profileData.majorId || "",
      desiredPositionId: profileData.desiredPositionId || "",
      skills: skillTokens,
    });

    setSelectedSkills(skillTokens);
  }, [profileData]);

  // load majors
  useEffect(() => {
    const fetchMajors = async () => {
      try {
        const response = await MajorService.getMajors();
        setMajors(response?.data || []);
      } catch {
        setMajors([]);
      }
    };

    if (isOpen) fetchMajors();
  }, [isOpen]);

  // load positions by majorId
  useEffect(() => {
    const fetchPositions = async () => {
      if (!isOpen || !formData.majorId) {
        setPositions([]);
        return;
      }

      setIsLoadingPositions(true);
      try {
        const res = await UserService.getPositions(formData.majorId);
        const list = Array.isArray(res?.data) ? res.data : [];
        setPositions(list);

        // nếu position hiện tại không còn hợp lệ -> reset
        const ids = new Set(list.map((p) => p.positionId ?? p.id));
        setFormData((prev) => {
          const cur = prev.desiredPositionId;
          if (cur && !ids.has(cur)) return { ...prev, desiredPositionId: "" };
          return prev;
        });
      } catch {
        setPositions([]);
      } finally {
        setIsLoadingPositions(false);
      }
    };

    fetchPositions();
  }, [isOpen, formData.majorId]);

  useEffect(() => {
    // Chỉ cảnh báo khi đã chọn position và primaryRole != all
    if (
      !formData.desiredPositionId ||
      primaryRole === "all" ||
      enabledRoles.includes("all")
    ) {
      setTooManyRolesWarning("");
      return;
    }

    // Tính secondary roles (không tính primary)
    const secondaryCount = enabledRoles.filter((r) => r !== primaryRole).length;

    if (secondaryCount >= MAX_SECONDARY_ROLES_WARNING_THRESHOLD) {
      const warningText =
        t("tooManyRolesWarning") ||
        `Bạn đang bật ${secondaryCount} secondary roles. Position của bạn là ${primaryRole.toUpperCase()}, hãy chắc là bạn có thể đảm nhận các role này.`;
      setTooManyRolesWarning(
        warningText.replace("{role}", primaryRole.toUpperCase())
      );
    } else {
      setTooManyRolesWarning("");
    }
  }, [enabledRoles, primaryRole, formData.desiredPositionId, t]);

  // load skills by majorId
  useEffect(() => {
    const fetchSkills = async () => {
      if (!formData.majorId) {
        setAvailableSkills([]);
        return;
      }

      try {
        const selectedMajor = majors.find(
          (m) => m.majorId === formData.majorId
        );
        if (!selectedMajor) {
          setAvailableSkills([]);
          return;
        }

        const response = await SkillService.list({
          major: selectedMajor.majorName,
        });

        setAvailableSkills(response?.data || []);
      } catch {
        setAvailableSkills([]);
      }
    };

    fetchSkills();
  }, [formData.majorId, majors]);

  // NEW: position -> primaryRole + enabledRoles default
  useEffect(() => {
    if (!formData.desiredPositionId) {
      setPrimaryRole("all");
      setEnabledRoles(["all"]);
      setSkillFilter("all");
      return;
    }

    const selectedPos = positions.find(
      (p) => (p.positionId ?? p.id) === formData.desiredPositionId
    );

    const posName = selectedPos?.positionName ?? selectedPos?.name ?? "";
    const inferredPrimary = inferPrimaryRoleFromPositionName(posName);

    // nếu inferred role nhưng skill catalog không có role đó (sau khi skills đã load) -> fallback all
    if (
      inferredPrimary !== "all" &&
      Array.isArray(availableSkills) &&
      availableSkills.length > 0 &&
      rolesInSkills.size > 0 &&
      !rolesInSkills.has(inferredPrimary)
    ) {
      const key = `${formData.desiredPositionId}-${inferredPrimary}`;
      if (fallbackWarnKeyRef.current !== key) {
        fallbackWarnKeyRef.current = key;
        notification.info({
          message: t("info") || "Info",
          description:
            t("positionNoRoleSkillsFallback") ||
            "Position này chưa có bộ skill theo role tương ứng, bạn có thể chọn skill bất kỳ.",
        });
      }

      setPrimaryRole("all");
      setEnabledRoles(["all"]);
      setSkillFilter("all");
      return;
    }

    setPrimaryRole(inferredPrimary);

    if (inferredPrimary === "all") {
      setEnabledRoles(["all"]);
      setSkillFilter("all");
      return;
    }

    const defaults = uniq([inferredPrimary]);

    setEnabledRoles(defaults);
    setSkillFilter(inferredPrimary);
  }, [formData.desiredPositionId, positions, availableSkills, rolesInSkills]);

  // Nếu skillFilter đang trỏ vào role đã bị tắt -> kéo về primary/all
  useEffect(() => {
    if (enabledRoles.includes("all")) return;
    if (skillFilter === "all") return;

    if (!enabledRoles.includes(skillFilter)) {
      setSkillFilter(primaryRole !== "all" ? primaryRole : "all");
    }
  }, [enabledRoles, skillFilter, primaryRole]);

  // NEW: prune selectedSkills khi enabledRoles thay đổi (khi tắt role)
  useEffect(() => {
    if (enabledRoles.includes("all")) return;
    if (!Array.isArray(selectedSkills) || selectedSkills.length === 0) return;
    if (!Array.isArray(availableSkills) || availableSkills.length === 0) return;

    const allowedSet = new Set(enabledRoles);
    const removed = [];

    const kept = selectedSkills.filter((token) => {
      const sk = availableSkills.find((s) => s.token === token);

      // nếu không có role -> giữ (tránh mất dữ liệu)
      if (!sk?.role) return true;

      const ok = allowedSet.has(sk.role);
      if (!ok) removed.push(token);
      return ok;
    });

    if (removed.length > 0 && kept.length !== selectedSkills.length) {
      setSelectedSkills(kept);
      setFormData((prev) => ({ ...prev, skills: kept }));

      const key = `${enabledRoles.sort().join(",")}-${removed
        .sort()
        .join(",")}`;
      if (pruneWarnKeyRef.current !== key) {
        pruneWarnKeyRef.current = key;
        setRoleToggleWarning(
          t("removedSkillsByRoleToggle") ||
            "Một số skill đã bị bỏ chọn vì bạn vừa tắt role tương ứng."
        );
      }
    }
  }, [enabledRoles, availableSkills, selectedSkills, t]);

  // Track primary skills real-time
  useEffect(() => {
    if (
      !isStudent ||
      !formData.desiredPositionId ||
      primaryRole === "all" ||
      selectedSkills.length === 0
    ) {
      setPrimarySkillsAlert("");
      return;
    }

    const skillCounts = countSkillsByRole(selectedSkills, availableSkills);
    const primaryCount = skillCounts[primaryRole] || 0;
    const remaining = MIN_PRIMARY_SKILLS - primaryCount;

    if (remaining > 0) {
      const alertText =
        t("needMorePrimarySkills") ||
        `Cần thêm ${remaining} skill ${primaryRole.toUpperCase()} (tối thiểu ${MIN_PRIMARY_SKILLS})`;
      setPrimarySkillsAlert(
        alertText
          .replace("{count}", remaining)
          .replace("{role}", primaryRole.toUpperCase())
          .replace("{min}", MIN_PRIMARY_SKILLS)
      );
    } else {
      setPrimarySkillsAlert("");
    }
  }, [
    selectedSkills,
    availableSkills,
    primaryRole,
    formData.desiredPositionId,
    isStudent,
    t,
  ]);

  const getRoleColor = (roleName) => ROLE_COLORS[roleName] || "default";

  const getRoleButtonClass = (roleName, isActive) => {
    const base =
      "px-3 py-1 rounded-full text-sm font-medium transition capitalize";
    if (!isActive) return `${base} bg-gray-200 text-gray-700 hover:bg-gray-300`;
    return `${base} ${ROLE_BUTTON_STYLES[roleName] || ROLE_BUTTON_STYLES.all}`;
  };

  const isSkillAllowed = (skill) => {
    if (!skill?.role) return true;
    if (enabledRoles.includes("all")) return true;
    return enabledRoles.includes(skill.role);
  };

  const toggleSecondaryRole = (r) => {
    if (!r) return;
    if (r === primaryRole) return; // primary role luôn bật
    if (primaryRole === "all") return; // đang unlock thì không dùng toggle này

    setEnabledRoles((prev) => {
      const cur = Array.isArray(prev) ? prev : [];
      if (cur.includes("all")) return [primaryRole, r]; // hiếm khi xảy ra
      if (cur.includes(r)) return cur.filter((x) => x !== r);
      return uniq([...cur, r]);
    });
  };

  const handleAddSkill = (skillToken) => {
    if (selectedSkills.includes(skillToken)) return;

    const skill = availableSkills.find((s) => s.token === skillToken);

    // chặn chọn ngoài enabledRoles
    if (skill && !isSkillAllowed(skill)) {
      const roleName = skill.role;
      const warningText =
        t("enableRoleToPickSkill") ||
        `Skill này thuộc "${roleName}". Hãy bật role "${roleName}" ở phần "I can also work on" để chọn.`;
      setSkillNotAllowedWarning(warningText.replace(/{role}/g, roleName));
      return;
    }

    const newSkills = [...selectedSkills, skillToken];
    setSelectedSkills(newSkills);
    setFormData((prev) => ({ ...prev, skills: newSkills }));

    if (errors.skills) setErrors((prev) => ({ ...prev, skills: "" }));
    if (skillNotAllowedWarning) setSkillNotAllowedWarning("");
  };

  const handleRemoveSkill = (skillToken) => {
    const newSkills = selectedSkills.filter((s) => s !== skillToken);
    setSelectedSkills(newSkills);
    setFormData((prev) => ({ ...prev, skills: newSkills }));
  };

  // base skills theo enabledRoles
  const baseAllowedSkills = useMemo(() => {
    if (!Array.isArray(availableSkills)) return [];
    if (enabledRoles.includes("all")) return availableSkills;
    return availableSkills.filter(
      (s) => !s.role || enabledRoles.includes(s.role)
    );
  }, [availableSkills, enabledRoles]);

  const filteredSkills = useMemo(() => {
    if (skillFilter === "all") return baseAllowedSkills;
    return baseAllowedSkills.filter((s) => s.role === skillFilter);
  }, [baseAllowedSkills, skillFilter]);

  const roleButtons = useMemo(() => {
    // "all" luôn là all-within-enabledRoles
    if (enabledRoles.includes("all")) return ["all", ...ALL_ROLES];

    // giữ thứ tự ALL_ROLES, nhưng ưu tiên primary lên đầu
    const enabledSet = new Set(enabledRoles);
    const ordered = [
      primaryRole,
      ...ALL_ROLES.filter((r) => r !== primaryRole && enabledSet.has(r)),
    ];
    return ["all", ...ordered.filter(Boolean)];
  }, [enabledRoles, primaryRole]);

  const roleCounts = useMemo(() => {
    const counts = {};
    const list = baseAllowedSkills;

    counts.all = list.length;
    for (const r of ALL_ROLES) {
      counts[r] = list.filter((s) => s.role === r).length;
    }
    return counts;
  }, [baseAllowedSkills]);

  const selectedSkillCounts = useMemo(
    () => countSkillsByRole(selectedSkills, availableSkills),
    [selectedSkills, availableSkills]
  );

  const validateForm = () => {
    const newErrors = {};

    if (isStudent && !formData.majorId)
      newErrors.majorId = t("required") || "Required";
    if (isStudent && !formData.desiredPositionId)
      newErrors.desiredPositionId = t("desiredPositionRequired") || "Required";

    if (isStudent && (!selectedSkills || selectedSkills.length === 0)) {
      newErrors.skills =
        t("skillsRequired") || "Please select at least 1 skill";
    }
    if (
      isStudent &&
      formData.desiredPositionId &&
      primaryRole !== "all" &&
      Array.isArray(availableSkills) &&
      availableSkills.length > 0 &&
      Array.isArray(selectedSkills) &&
      selectedSkills.length > 0
    ) {
      const skillMap = new Map(availableSkills.map((s) => [s.token, s]));
      const primaryCount = selectedSkills.reduce((acc, token) => {
        const sk = skillMap.get(token);
        return acc + (sk?.role === primaryRole ? 1 : 0);
      }, 0);

      if (primaryCount < MIN_PRIMARY_SKILLS) {
        const errorText =
          t("minPrimarySkillsRequired") ||
          `Bạn cần chọn ít nhất ${MIN_PRIMARY_SKILLS} skill thuộc ${primaryRole.toUpperCase()} (theo position đã chọn).`;
        newErrors.skills = errorText
          .replace("{min}", MIN_PRIMARY_SKILLS)
          .replace("{role}", primaryRole.toUpperCase());
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Nếu có warning về quá nhiều roles -> confirm trước khi submit
    if (tooManyRolesWarning) {
      Modal.confirm({
        title: t("confirmTitle") || "Xác nhận",
        content: (
          <div className="space-y-2">
            <p className="text-orange-600 font-medium">{tooManyRolesWarning}</p>
            <p className="text-gray-700">
              {t("confirmTooManyRolesContent") ||
                "Bạn có chắc chắn muốn tiếp tục?"}
            </p>
          </div>
        ),
        okText: t("continue") || "Tiếp tục",
        cancelText: t("goBack") || "Quay lại",
        okButtonProps: { danger: true },
        zIndex: 10000,
        onOk: () => submitProfile(),
      });
      return;
    }

    submitProfile();
  };

  const submitProfile = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        skills: selectedSkills,
        desiredPositionId: formData.desiredPositionId || null,
        skillsCompleted: true,
      };

      const res = await UserService.updateMyProfile(payload);

      notification.success({
        message: t("success") || "Success",
        description:
          t("profileUpdatedSuccessfully") || "Profile updated successfully",
      });

      onComplete?.(res?.data ?? payload);
      onClose?.();
    } catch (err) {
      notification.error({
        message: t("error") || "Error",
        description:
          err?.response?.data?.message ||
          t("updateProfileFailed") ||
          "Update profile failed",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose?.();
  };

  if (!isOpen) return null;

  const selectedMajorName =
    majors.find((m) => m.majorId === formData.majorId)?.majorName ||
    majors.find((m) => m.majorId === formData.majorId)?.name ||
    formData.majorId ||
    t("notSpecified") ||
    "Not specified";

  const showSecondaryToggle =
    isStudent && primaryRole !== "all" && !!formData.desiredPositionId;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fadeIn">
        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-8 h-8" />
              <h2 className="text-2xl font-bold">
                {t("completeYourProfile") || "Complete your profile"}
              </h2>
            </div>
          </div>

          <p className="text-white/90">
            {isStudent
              ? t("selectYourSkills") || "Select your position & skills"
              : t("completeBasicInfo") || "Complete basic info"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label
              htmlFor="majorId"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              {t("major") || "Major"}{" "}
              <span className="text-gray-400 text-xs">
                {t("majorProvidedBySchool") || "(Provided by school)"}
              </span>
            </label>

            <input
              type="text"
              value={selectedMajorName}
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed outline-none"
            />

            {errors.majorId && (
              <p className="text-red-500 text-sm mt-1">{errors.majorId}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="desiredPositionId"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              {t("desiredPosition") || "Desired Position"}{" "}
              {isStudent ? <span className="text-red-500">*</span> : null}
            </label>

            <select
              id="desiredPositionId"
              value={formData.desiredPositionId}
              onChange={(e) => {
                const value = e.target.value;
                setFormData((prev) => ({ ...prev, desiredPositionId: value }));
                if (errors.desiredPositionId) {
                  setErrors((prev) => ({ ...prev, desiredPositionId: "" }));
                }
              }}
              disabled={!formData.majorId || isLoadingPositions}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">
                {isLoadingPositions
                  ? t("loading") || "Loading..."
                  : t("selectPosition") || "Select a position"}
              </option>

              {positions.map((p) => {
                const id = p.positionId ?? p.id;
                const name = p.positionName ?? p.name ?? p.title ?? String(id);
                return (
                  <option key={id} value={id}>
                    {name}
                  </option>
                );
              })}
            </select>

            {errors.desiredPositionId && (
              <p className="text-red-500 text-sm mt-1">
                {errors.desiredPositionId}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("skills") || "Skills"}{" "}
              {isStudent ? (
                <span className="text-red-500">*</span>
              ) : (
                <span className="text-gray-400">
                  ({t("optional") || "Optional"})
                </span>
              )}
            </label>

            {!formData.majorId ? (
              <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
                {t("pleaseFillAllFields") || "Please fill all fields"}
              </div>
            ) : (
              <div className="space-y-4">
                {roleToggleWarning && (
                  <Alert
                    type="warning"
                    showIcon
                    message={roleToggleWarning}
                    closable
                    onClose={() => setRoleToggleWarning("")}
                  />
                )}

                {primarySkillsAlert && (
                  <Alert
                    type="info"
                    showIcon
                    message={primarySkillsAlert}
                    className="border-blue-400 bg-blue-50"
                  />
                )}

                <div className="min-h-[100px] p-4 border-2 border-dashed border-blue-300 rounded-lg bg-blue-50">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    {t("yourSelectedSkills") || "Your selected skills"} (
                    {selectedSkills.length})
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {selectedSkills.length === 0 ? (
                      <p className="text-gray-400 text-sm">
                        {t("clickSkillsBelowToAdd") ||
                          "Click skills below to add"}
                      </p>
                    ) : (
                      selectedSkills.map((skillToken) => {
                        const skill = availableSkills.find(
                          (s) => s.token === skillToken
                        );
                        const label = skillToken;

                        return (
                          <Tag
                            key={skillToken}
                            color={getRoleColor(skill?.role)}
                            closable
                            onClose={() => handleRemoveSkill(skillToken)}
                            className="cursor-pointer"
                          >
                            {label}
                          </Tag>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* NEW: Secondary roles toggle (primaryRole luôn bật) */}
                {showSecondaryToggle && (
                  <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="text-sm font-medium text-gray-700">
                        {t("iCanAlsoWorkOn") || "I can also work on"}{" "}
                        <span className="text-gray-400 font-normal">
                          ({t("optional") || "optional"})
                        </span>
                      </div>

                      <div className="text-xs text-gray-500">
                        {t("toggleRolesHint") ||
                          "Enable extra roles to pick cross-stack skills."}
                      </div>
                    </div>

                    <div className="flex gap-2 flex-wrap mt-3">
                      {/* primary */}
                      <button
                        type="button"
                        disabled
                        className={`${getRoleButtonClass(
                          primaryRole,
                          true
                        )} opacity-90 cursor-not-allowed flex items-center gap-1`}
                        title={t("primaryRole") || "Primary role"}
                      >
                        <span>{primaryRole}</span>
                        <span className="opacity-70 text-xs">
                          ({t("primary") || "primary"})
                        </span>
                        {(selectedSkillCounts[primaryRole] || 0) >=
                          MIN_PRIMARY_SKILLS && (
                          <CheckCircle className="w-3 h-3" />
                        )}
                        {(selectedSkillCounts[primaryRole] || 0) > 0 && (
                          <span className="px-1.5 py-0.5 bg-white/20 rounded-full text-xs font-bold">
                            {selectedSkillCounts[primaryRole]}
                          </span>
                        )}
                      </button>

                      {/* secondary toggles */}
                      {ALL_ROLES.filter((r) => r !== primaryRole).map((r) => {
                        const active = enabledRoles.includes(r);
                        const skillCount = selectedSkillCounts[r] || 0;
                        return (
                          <button
                            key={r}
                            type="button"
                            onClick={() => toggleSecondaryRole(r)}
                            className={`${getRoleButtonClass(
                              r,
                              active
                            )} flex items-center gap-1.5`}
                            title={
                              active
                                ? t("clickToDisable") || "Click to disable"
                                : t("clickToEnable") || "Click to enable"
                            }
                          >
                            <span>{r}</span>
                            {skillCount > 0 && (
                              <span className="px-1.5 py-0.5 bg-white/20 rounded-full text-xs font-bold">
                                {skillCount}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* ✅ warning nằm NGAY DƯỚI block toggle */}
                    {tooManyRolesWarning && (
                      <div className="mt-3">
                        <Alert
                          type="warning"
                          showIcon
                          message={tooManyRolesWarning}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Filters (giữ UI cũ): all-within-enabled + từng role đang bật (hoặc all roles nếu unlocked) */}
                <div className="flex gap-2 flex-wrap">
                  {roleButtons.map((r) => {
                    const count = roleCounts[r] ?? 0;

                    // nếu unlocked thì ẩn role không có skill
                    if (
                      enabledRoles.includes("all") &&
                      r !== "all" &&
                      count === 0
                    )
                      return null;

                    // nếu locked thì chỉ render role đã bật (roleButtons đã đảm bảo)
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setSkillFilter(r)}
                        className={getRoleButtonClass(r, skillFilter === r)}
                      >
                        {r === "all" ? t("all") || "All" : r} ({count})
                      </button>
                    );
                  })}
                </div>

                <div className="max-h-[250px] overflow-y-auto p-4 border border-gray-300 rounded-lg bg-white">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    {t("availableSkills") || "Available skills"}
                  </p>

                  {skillNotAllowedWarning && (
                    <div className="mb-3">
                      <Alert
                        type="warning"
                        showIcon
                        message={skillNotAllowedWarning}
                        closable
                        onClose={() => setSkillNotAllowedWarning("")}
                      />
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {filteredSkills.map((skill) => {
                      const isSelected = selectedSkills.includes(skill.token);
                      const label = skill.token;

                      return (
                        <Tag
                          key={skill.token}
                          color={
                            isSelected ? "default" : getRoleColor(skill.role)
                          }
                          className={`cursor-pointer transition ${
                            isSelected
                              ? "opacity-40 cursor-not-allowed"
                              : "hover:scale-105"
                          }`}
                          onClick={() =>
                            !isSelected && handleAddSkill(skill.token)
                          }
                        >
                          {label}
                          {!isSelected && (
                            <Plus className="inline-block w-3 h-3 ml-1" />
                          )}
                        </Tag>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {errors.skills && (
              <p className="text-red-500 text-sm mt-1">{errors.skills}</p>
            )}

            {showSecondaryToggle && (
              <p className="text-xs text-gray-500 mt-2">
                {t("primaryVsSkillsHint") ||
                  "Position is your primary preference. Skills can be cross-stack — just enable the roles you can work on."}
              </p>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">
                  {isStudent
                    ? t("whySkills") || "Why we need this?"
                    : t("quickSetup") || "Quick setup"}
                </p>
                <p>
                  {isStudent
                    ? t("weUseYourSkills") ||
                      "We use your skills to match teams."
                    : t("youCanUpdateAnytime") || "You can update anytime."}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg shadow-lg"
            >
              {isSubmitting
                ? t("completingProfile") || "Completing..."
                : t("completeYourProfile") || "Complete profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfileModal;
