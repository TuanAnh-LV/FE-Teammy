import React from "react";
import { useTranslation } from "../../../hook/useTranslation";
import { Modal, Input, Button, Form, notification } from "antd";
import { PostService } from "../../../services/post.service";

const { TextArea } = Input;

const CreatePersonalPostModal = ({
  isOpen,
  closeModal,
  onCreated,
  currentUserName = "",
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();

  // Lấy skills từ userInfo giống như name
  const savedUser = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const currentUserSkills = savedUser.skills || [];

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const { title, description } = values;

      // Sử dụng skills từ userInfo
      const skillsCsv = Array.isArray(currentUserSkills)
        ? currentUserSkills.join(",")
        : String(currentUserSkills || "");

      await PostService.createPersonalPost({
        title,
        description,
        skills: skillsCsv,
      });

      notification.success({
        message: t("createProfilePostSuccess") || "Profile post created",
      });
      form.resetFields();
      closeModal();
      onCreated?.();
    } catch (err) {
      notification.error({
        message:
          t("createProfilePostFailed") || "Failed to create profile post",
        description:
          err?.response?.data?.message ||
          t("pleaseTryAgain") ||
          "Please try again",
      });
    }
  };

  return (
    <Modal
      title={t("createPersonalProfileTitle") || "Create Personal Profile"}
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
          title: "",
          description: "",
          name: currentUserName,
          skills: Array.isArray(currentUserSkills)
            ? currentUserSkills.join(", ")
            : currentUserSkills,
        }}
      >
        {/* chỉ hiển thị tên */}
        <Form.Item label={t("fullName") || "Full Name"} name="name">
          <Input readOnly />
        </Form.Item>

        <Form.Item
          label={t("titleLabel") || "Title"}
          name="title"
          rules={[
            {
              required: true,
              message: t("pleaseEnterTitle") || "Please enter title",
            },
          ]}
        >
          <Input
            placeholder={
              t("placeholderTitle") || "E.g.: Looking for FE team member"
            }
          />
        </Form.Item>

        <Form.Item
          label={t("descriptionLabel") || "Description"}
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
              t("placeholderDescription") ||
              "Short description about your need/experience"
            }
          />
        </Form.Item>

        {/* Skills chỉ hiển thị, không cho nhập */}
        <Form.Item label={t("skillsLabel") || "Skills"} name="skills">
          <Input readOnly />
        </Form.Item>

        <div className="flex justify-between mt-4">
          <Button
            onClick={() => {
              form.resetFields();
              closeModal();
            }}
            className="!border-gray-300 hover:!border-orange-400 hover:!text-orange-400 transition-all"
          >
            {t("cancel") || "Cancel"}
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            className="!bg-[#FF7A00] hover:!opacity-90 !text-white !border-none"
          >
            {t("publishProfile") || "Publish Profile"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default CreatePersonalPostModal;
