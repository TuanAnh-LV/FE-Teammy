import React, { useEffect, useState } from "react";
import { useTranslation } from "../../../hook/useTranslation";
import {
  Modal,
  Input,
  Button,
  Form,
  InputNumber,
  notification,
  DatePicker,
  Tag,
} from "antd";
import { Plus } from "lucide-react";
import { PostService } from "../../../services/post.service";
import { SkillService } from "../../../services/skill.service";
import moment from "moment";

const { TextArea } = Input;

/**
 * Props:
 * - isOpen, closeModal
 * - onCreated?: () => void
 * - defaultGroupId?: string (nếu có thể auto-fill từ membership)
 */
const CreatePostModal = ({ isOpen, closeModal, onCreated, defaultGroupId }) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [groupName, setGroupName] = useState("");
  const [majorName, setMajorName] = useState("");
  const [availableSkills, setAvailableSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [skillFilter, setSkillFilter] = useState("all");

  useEffect(() => {
    let mounted = true;
    const loadGroupName = async () => {
      try {
        if (!defaultGroupId) return;
        const res = await import("../../../services/group.service").then((m) =>
          m.GroupService.getGroupDetail(defaultGroupId)
        );
        const name = res?.data?.title || res?.data?.name || "";
        const major = res?.data?.major?.majorName || res?.data?.majorName || "";
        if (mounted) {
          setGroupName(name);
          setMajorName(major);
        }
      } catch {
        // ignore silently
      }
    };
    loadGroupName();
    return () => {
      mounted = false;
    };
  }, [defaultGroupId]);

  // Fetch skills when majorName is available
  useEffect(() => {
    const fetchSkills = async () => {
      if (!majorName) {
        setAvailableSkills([]);
        return;
      }

      try {
        const response = await SkillService.list({ major: majorName });
        if (response?.data) {
          setAvailableSkills(response.data);
        }
      } catch (error) {
        console.error("Error fetching skills:", error);
        setAvailableSkills([]);
      }
    };

    fetchSkills();
  }, [majorName]);

  const handleAddSkill = (skillToken) => {
    if (!selectedSkills.includes(skillToken)) {
      const newSkills = [...selectedSkills, skillToken];
      setSelectedSkills(newSkills);
      form.setFieldsValue({ skills: newSkills });
    }
  };

  const handleRemoveSkill = (skillToken) => {
    const newSkills = selectedSkills.filter((s) => s !== skillToken);
    setSelectedSkills(newSkills);
    form.setFieldsValue({ skills: newSkills });
  };

  const filteredSkills = availableSkills.filter((skill) => {
    if (skillFilter === "all") return true;
    return skill.role === skillFilter;
  });

  const getRoleColor = (role) => {
    const colors = {
      frontend: "blue",
      backend: "green",
      mobile: "purple",
      devops: "orange",
      qa: "red",
    };
    return colors[role] || "default";
  };

  const handleSubmit = async () => {
    try {
      const {
        groupId,
        title,
        description,
        position_needed,
        expiresAt,
        skills,
      } = await form.validateFields();

      await PostService.createRecruitmentPost({
        groupId,
        title,
        description,
        position_needed,
        expiresAt: expiresAt?.toISOString(),
        skills: skills || [],
      });

      notification.success({
        message: t("createRecruitPostSuccess") || "Recruitment post created",
      });
      form.resetFields();
      setSelectedSkills([]);
      closeModal();
      onCreated?.();
    } catch {
      /* validate/API error handled elsewhere */
    }
  };

  return (
    <Modal
      title={t("createRecruitPostTitle") || "Create Recruitment Post"}
      open={isOpen}
      onCancel={() => {
        form.resetFields();
        setSelectedSkills([]);
        closeModal();
      }}
      footer={null}
      width={700}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          groupId: defaultGroupId || "",
          title: "",
          description: "",
          position_needed: "",
          expiresAt: null,
          skills: [],
        }}
      >
        {/* Keep groupId as a hidden form field, display the group name as a disabled field */}
        <Form.Item name="groupId" hidden>
          <Input />
        </Form.Item>

        <Form.Item label={t("group") || "Group"} shouldUpdate>
          <Input value={groupName || defaultGroupId || ""} disabled />
        </Form.Item>

        <Form.Item
          label={t("pleaseEnterTitle") ? "Title" : "Title"}
          name="title"
          rules={[
            {
              required: true,
              message: t("pleaseEnterTitle") || "Please enter title",
            },
          ]}
        >
          <Input
            placeholder={t("placeholderTitle") || "VD: Tuyển FE cho project"}
          />
        </Form.Item>

        <Form.Item
          label={t("pleaseEnterDescription") ? "Description" : "Description"}
          name="description"
          rules={[
            {
              required: true,
              message:
                t("pleaseEnterDescription") || "Please enter description",
            },
          ]}
        >
          <TextArea
            rows={4}
            placeholder={
              t("placeholderDescription") || "Mô tả yêu cầu, stack..."
            }
          />
        </Form.Item>

        <Form.Item
          label={
            t("pleaseEnterPosition") ? "Position Needed" : "Position Needed"
          }
          name="position_needed"
          rules={[
            {
              required: true,
              message:
                t("pleaseEnterPosition") || "Please enter the position needed",
            },
          ]}
        >
          <Input placeholder={t("placeholderSkills") || "VD: Git, Azure"} />
        </Form.Item>

        {/* Expires At Field */}
        <Form.Item
          label={t("pleaseSelectDeadline") ? "Expires At" : "Expires At"}
          name="expiresAt"
          rules={[
            {
              required: true,
              message: t("pleaseSelectDeadline") || "Please select deadline",
            },
            {
              validator: (_, value) =>
                value && value.isAfter(moment())
                  ? Promise.resolve()
                  : Promise.reject(
                      t("deadlineMustBeFuture") ||
                        "Expires date must be after now!"
                    ),
            },
          ]}
        >
          <DatePicker
            style={{ width: "100%" }}
            disabledDate={(current) =>
              current && current < moment().endOf("day")
            }
            placeholder="Chọn ngày hết hạn"
          />
        </Form.Item>

        {/* Skills Selection */}
        <Form.Item
          label={t("requiredSkills") || "Required Skills"}
          name="skills"
        >
          <div className="space-y-3">
            {/* Selected Skills */}
            <div className="min-h-[80px] p-3 border-2 border-dashed border-blue-300 rounded-lg bg-blue-50">
              <p className="text-xs font-medium text-gray-700 mb-2">
                Selected Skills ({selectedSkills.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedSkills.length === 0 ? (
                  <p className="text-gray-400 text-xs">
                    Click skills below to add them
                  </p>
                ) : (
                  selectedSkills.map((skillToken) => {
                    const skill = availableSkills.find(
                      (s) => s.token === skillToken
                    );
                    return (
                      <Tag
                        key={skillToken}
                        color={getRoleColor(skill?.role)}
                        closable
                        onClose={() => handleRemoveSkill(skillToken)}
                        className="cursor-pointer"
                      >
                        {skillToken}
                      </Tag>
                    );
                  })
                )}
              </div>
            </div>

            {/* Role Filter */}
            {majorName && availableSkills.length > 0 && (
              <>
                <div className="flex gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setSkillFilter("all")}
                    className={`px-2 py-1 rounded-full text-xs font-medium transition ${
                      skillFilter === "all"
                        ? "bg-gray-800 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    All ({availableSkills.length})
                  </button>
                  {["frontend", "backend", "mobile", "devops", "qa"].map(
                    (role) => {
                      const count = availableSkills.filter(
                        (s) => s.role === role
                      ).length;
                      if (count === 0) return null;
                      return (
                        <button
                          key={role}
                          type="button"
                          onClick={() => setSkillFilter(role)}
                          className={`px-2 py-1 rounded-full text-xs font-medium transition capitalize ${
                            skillFilter === role
                              ? "bg-blue-600 text-white"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          }`}
                        >
                          {role} ({count})
                        </button>
                      );
                    }
                  )}
                </div>

                {/* Available Skills */}
                <div className="max-h-[200px] overflow-y-auto p-3 border border-gray-300 rounded-lg bg-white">
                  <p className="text-xs font-medium text-gray-700 mb-2">
                    Available Skills (Click to add)
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {filteredSkills.map((skill) => {
                      const isSelected = selectedSkills.includes(skill.token);
                      return (
                        <Tag
                          key={skill.token}
                          color={
                            isSelected ? "default" : getRoleColor(skill.role)
                          }
                          className={`cursor-pointer transition text-xs ${
                            isSelected
                              ? "opacity-40 cursor-not-allowed"
                              : "hover:scale-105"
                          }`}
                          onClick={() =>
                            !isSelected && handleAddSkill(skill.token)
                          }
                        >
                          {skill.token}
                          {!isSelected && (
                            <Plus className="inline-block w-3 h-3 ml-1" />
                          )}
                        </Tag>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {!majorName && (
              <p className="text-xs text-gray-500">
                Skills will be available after loading group information
              </p>
            )}
          </div>
        </Form.Item>

        <div className="flex justify-between mt-4">
          <Button
            onClick={() => {
              form.resetFields();
              setSelectedSkills([]);
              closeModal();
            }}
            className="inline-flex items-center rounded-lg px-3.5 py-2 text-xs font-bold shadow-sm hover:!border-orange-400 hover:!text-orange-400 transition-all focus:outline-none focus:ring-4 focus:ring-blue-100"
          >
            {t("cancel") || "Cancel"}
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            className="inline-flex items-center rounded-lg !bg-[#FF7A00] px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:!opacity-90 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:opacity-60"
          >
            {t("publishPost") || "Publish Post"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default CreatePostModal;
