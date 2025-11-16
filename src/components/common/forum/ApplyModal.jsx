import React, { useMemo, useState, useEffect } from "react";
import { Modal, Select, Input, message, Button } from "antd";
import { useTranslation } from "../../../hook/useTranslation";

// post.position_needed: "Frontend Developer, Backend Developer"
const ApplyModal = ({ open, onClose, post, onSubmit }) => {
  const { t } = useTranslation();
  const [position, setPosition] = useState("");
  const [desc, setDesc] = useState("");

  useEffect(() => {
    // reset khi mở modal cho post mới
    if (open) {
      setPosition("");
      setDesc("");
    }
  }, [open, post?.id]);

  const positionOptions = useMemo(() => {
    const raw = post?.position_needed ?? post?.positionNeeded ?? "";
    return String(raw)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }, [post]);

  const handleOk = () => {
    if (!position || !desc) {
      message.error(t("pleaseFillAllFields") || "Please fill all fields");
      return;
    }
    // BE chỉ nhận 1 trường message: "<position> - <description>"
    const payload = { message: `${position} - ${desc}` };
    onSubmit?.(payload, { position, description: desc });
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={
        <div className="space-y-1">
          <div className="text-lg font-semibold">
            {t("applyToJoin") || "Apply to Join"}
          </div>
          <div className="text-sm text-gray-600">
            <span className="text-sm text-gray-500 mr-1">
              {t("applyingTo") || "Applying to:"}
            </span>
            <span className="font-medium">
              {post?.group?.name || post?.title || ""}
            </span>
          </div>
          {(post?.position_needed ||
            post?.positionNeeded ||
            post?.description) && (
            <div className="text-sm text-gray-500">
              {post?.position_needed ||
                post?.positionNeeded ||
                post?.description}
            </div>
          )}
        </div>
      }
      footer={[
        <Button key="cancel" onClick={onClose}>
          {t("cancel") || "Cancel"}
        </Button>,
        <Button key="ok" type="primary" onClick={handleOk}>
          {t("submit") || "Submit"}
        </Button>,
      ]}
      destroyOnClose
    >
      <div className="space-y-4">
        <div>
          <div className="mb-1 text-sm font-medium">
            {t("roleForApplying") || "Position you're applying for"}
          </div>
          <Select
            showSearch
            allowClear
            placeholder={t("selectRole") || "Select a role"}
            value={position || undefined}
            onChange={setPosition}
            style={{ width: "100%" }}
            options={positionOptions.map((p) => ({ value: p, label: p }))}
          />
        </div>

        <div>
          <div className="mb-1 text-sm font-medium">
            {t("whyJoin") || "Why you want to join this project?"}
          </div>
          <Input.TextArea
            rows={4}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder={t("enterDescription") || "Enter description"}
          />
        </div>
      </div>
    </Modal>
  );
};

export default ApplyModal;
