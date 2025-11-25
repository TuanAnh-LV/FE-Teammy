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
} from "antd";
import { PostService } from "../../../services/post.service";
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

  useEffect(() => {
    let mounted = true;
    const loadGroupName = async () => {
      try {
        if (!defaultGroupId) return;
        const res = await import("../../../services/group.service").then((m) =>
          m.GroupService.getGroupDetail(defaultGroupId)
        );
        const name = res?.data?.title || res?.data?.name || "";
        if (mounted) setGroupName(name);
      } catch {
        // ignore silently
      }
    };
    loadGroupName();
    return () => {
      mounted = false;
    };
  }, [defaultGroupId]);

  const handleSubmit = async () => {
    try {
      const { groupId, title, description, position_needed, expiresAt } =
        await form.validateFields();

      await PostService.createRecruitmentPost({
        groupId,
        title,
        description,
        position_needed,
        expiresAt: expiresAt?.toISOString(),
      });

      notification.success({
        message: t("createRecruitPostSuccess") || "Recruitment post created",
      });
      form.resetFields();
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
        closeModal();
      }}
      footer={null}
      width={600}
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
          expiresAt: null, // Đặt giá trị mặc định cho expiresAt là null
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
            } // Disable past dates
            placeholder="Chọn ngày hết hạn"
          />
        </Form.Item>

        <div className="flex justify-between mt-4">
          <Button
            onClick={() => {
              form.resetFields();
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
