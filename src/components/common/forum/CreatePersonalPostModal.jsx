import React from "react";
import { useTranslation } from "../../../hook/useTranslation";
import { Modal, Input, Button, Form, notification } from "antd";
import { PostService } from "../../../services/post.service";
import { AuthService } from "../../../services/auth.service";

const { TextArea } = Input;

const CreatePersonalPostModal = ({
  isOpen,
  closeModal,
  onCreated,
  currentUserName = "",
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [currentUserInfo, setCurrentUserInfo] = React.useState({
    skills: [],
  });

  // Lấy thông tin user từ API khi modal mở
  React.useEffect(() => {
    if (isOpen) {
      const fetchUserInfo = async () => {
        try {
          const response = await AuthService.me();
          const userData = response.data;
          setCurrentUserInfo({
            name: userData.displayName || currentUserName,
            skills: userData.skills || [],
          });
          // Cập nhật form với dữ liệu mới
          form.setFieldsValue({
            name: userData.displayName || currentUserName,
            skills: Array.isArray(userData.skills)
              ? userData.skills.join(", ")
              : userData.skills,
          });
        } catch (err) {
          console.error("Failed to fetch user info:", err);
          // Fallback về giá trị props nếu API fail
          setCurrentUserInfo({
            name: currentUserName,
            skills: [],
          });
        }
      };
      fetchUserInfo();
    }
  }, [isOpen, currentUserName, form]);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const values = await form.validateFields();
      const { title, description } = values;

      // Sử dụng skills từ API
      const skillsCsv = Array.isArray(currentUserInfo.skills)
        ? currentUserInfo.skills.join(",")
        : String(currentUserInfo.skills || "");

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
    } finally {
      setIsSubmitting(false);
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
          name: currentUserInfo.name,
          skills: Array.isArray(currentUserInfo.skills)
            ? currentUserInfo.skills.join(", ")
            : currentUserInfo.skills,
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
            loading={isSubmitting}
            disabled={isSubmitting}
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
