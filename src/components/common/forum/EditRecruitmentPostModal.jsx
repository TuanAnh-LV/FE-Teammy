import React, { useEffect, useState } from "react";
import { useTranslation } from "../../../hook/useTranslation";
import {
  Modal,
  Input,
  Button,
  Form,
  notification,
  DatePicker,
  Tag,
} from "antd";
import { Plus } from "lucide-react";
import { PostService } from "../../../services/post.service";
import { SkillService } from "../../../services/skill.service";
import dayjs from "dayjs";

const { TextArea } = Input;

const EditRecruitmentPostModal = ({
  isOpen,
  closeModal,
  onUpdated,
  post,
  majorName,
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [availableSkills, setAvailableSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [skillFilter, setSkillFilter] = useState("all");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen || !post) return;

    console.log("EditRecruitmentPostModal - post data:", post);

    let existingSkills = [];
    const skillsData =
      post.required_skills ||
      post.requiredSkills ||
      post.skills ||
      post.skillsRequired ||
      "";

    if (Array.isArray(skillsData)) {
      existingSkills = skillsData;
    } else if (typeof skillsData === "string") {
      existingSkills = skillsData
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }

    console.log("Parsed skills:", existingSkills);

    setSelectedSkills(existingSkills);

    const deadlineRaw =
      post.expires_at ||
      post.applicationDeadline ||
      post.expiresAt ||
      post.deadline ||
      post.expiredAt;

    const deadline = deadlineRaw ? dayjs(deadlineRaw) : null;

    form.setFieldsValue({
      title: post.title || "",
      description: post.description || "",
      position_needed: post.position_needed || post.positionNeeded || "",
      expires_at: deadline && deadline.isValid() ? deadline : null,
      required_skills: existingSkills,
    });
  }, [isOpen, post, form]);

  useEffect(() => {
    if (!isOpen || !majorName) return;

    const fetchSkills = async () => {
      try {
        const response = await SkillService.list({ major: majorName });
        if (response?.data) {
          setAvailableSkills(response.data);
        }
      } catch {
        setAvailableSkills([]);
      }
    };

    fetchSkills();
  }, [majorName, isOpen]);

  const handleAddSkill = (skillToken) => {
    if (!selectedSkills.includes(skillToken)) {
      const newSkills = [...selectedSkills, skillToken];
      setSelectedSkills(newSkills);
      form.setFieldsValue({ required_skills: newSkills });
    }
  };

  const handleRemoveSkill = (skillToken) => {
    const newSkills = selectedSkills.filter((s) => s !== skillToken);
    setSelectedSkills(newSkills);
    form.setFieldsValue({ required_skills: newSkills });
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
      setIsSubmitting(true);
      const {
        title,
        description,
        position_needed,
        expires_at,
        required_skills,
      } = await form.validateFields();

      await PostService.updateRecruitmentPost(post.id, {
        title,
        description,
        position_needed,
        expires_at: expires_at?.toISOString(),
        required_skills,
      });

      notification.success({
        message: t("updateRecruitPostSuccess") || "Recruitment post updated",
      });
      form.resetFields();
      setSelectedSkills([]);
      closeModal();
      onUpdated?.();
    } catch {
      /* validate/API error handled elsewhere */
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      title={t("editRecruitPostTitle") || "Edit Recruitment Post"}
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
          title: "",
          description: "",
          position_needed: "",
          expires_at: null,
          required_skills: [],
        }}
      >
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

        <Form.Item
          label={t("pleaseSelectDeadline") ? "Expires At" : "Expires At"}
          name="expires_at"
          rules={[
            {
              required: true,
              message: t("pleaseSelectDeadline") || "Please select deadline",
            },
          ]}
        >
          <DatePicker
            style={{ width: "100%" }}
            format="YYYY-MM-DD"
            disabledDate={(current) =>
              current && current < dayjs().endOf("day")
            }
            placeholder="Chọn ngày hết hạn"
          />
        </Form.Item>

        {/* Skills Section */}
        <Form.Item
          label={t("requiredSkills") || "Required Skills"}
          name="required_skills"
          rules={[
            {
              validator: (_, value) => {
                if (!value || value.length < 3) {
                  return Promise.reject(
                    new Error(
                      t("pleaseSelectAtLeast3Skills") ||
                        "Please select at least 3 skills"
                    )
                  );
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <div className="space-y-3">
            {/* Selected Skills Area */}
            <div className="min-h-[80px] p-3 border-2 border-dashed border-blue-300 rounded-lg bg-blue-50">
              <p className="text-xs font-medium text-gray-700 mb-2">
                {t("selectedSkills") ||
                  `Selected Skills (${selectedSkills.length})`}
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedSkills.length === 0 ? (
                  <p className="text-gray-400 text-xs">
                    {t("clickSkillsToAdd") || "Click skills below to add them"}
                  </p>
                ) : (
                  selectedSkills.map((skillToken) => {
                    const skill = availableSkills.find(
                      (s) =>
                        s.token === skillToken || s.skillToken === skillToken
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

            {/* Skill Filter Buttons */}
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
                    {t("all") || "All"} ({availableSkills.length})
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
                    {t("availableSkillsClickToAdd") ||
                      "Available Skills (Click to add)"}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {filteredSkills.map((skill) => {
                      const skillToken = skill.token || skill.skillToken;
                      const isSelected = selectedSkills.includes(skillToken);
                      return (
                        <Tag
                          key={skillToken}
                          color={
                            isSelected ? "default" : getRoleColor(skill.role)
                          }
                          className={`cursor-pointer transition text-xs ${
                            isSelected
                              ? "opacity-40 cursor-not-allowed"
                              : "hover:scale-105"
                          }`}
                          onClick={() =>
                            !isSelected && handleAddSkill(skillToken)
                          }
                        >
                          {skillToken}
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
                {t("skillsWillBeAvailableAfterLoadingGroupInformation") ||
                  "Skills will be available after loading group information"}
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
            loading={isSubmitting}
            disabled={isSubmitting}
            className="inline-flex items-center rounded-lg !bg-[#FF7A00] px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:!opacity-90 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:opacity-60"
          >
            {t("updatePost") || "Update Post"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default EditRecruitmentPostModal;
