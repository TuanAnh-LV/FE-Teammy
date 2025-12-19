import React from "react";
import { useTranslation } from "../../../hook/useTranslation";
import { Modal, Input, Button, Form, notification } from "antd";
import { PostService } from "../../../services/post.service";

const { TextArea } = Input;

const EditPersonalPostModal = ({ isOpen, closeModal, onUpdated, post }) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (isOpen && post) {
      form.setFieldsValue({
        title: post.title || "",
        description: post.description || "",
      });
    }
  }, [isOpen, post, form]);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const values = await form.validateFields();
      const { title, description } = values;

      await PostService.updatePersonalPost(post.id, {
        title,
        description,
      });

      notification.success({
        message: t("updateProfilePostSuccess") || "Profile post updated",
      });
      form.resetFields();
      closeModal();
      onUpdated?.();
    } catch (err) {
      notification.error({
        message:
          t("updateProfilePostFailed") || "Failed to update profile post",
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
      title={t("editPersonalProfileTitle") || "Edit Personal Profile"}
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
        }}
      >
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
            {t("updateProfile") || "Update Profile"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default EditPersonalPostModal;
