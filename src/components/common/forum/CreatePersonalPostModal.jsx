import React from "react";
import { Modal, Input, Button, Form, notification } from "antd";
import { PostService } from "../../../services/post.service";

const { TextArea } = Input;

/**
 * Props:
 * - isOpen, closeModal
 * - onCreated?: () => void   // gọi lại để refetch list
 * - currentUserName?: string // chỉ để hiển thị
 */
const CreatePersonalPostModal = ({
  isOpen,
  closeModal,
  onCreated,
  currentUserName = "",
}) => {
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const { title, description, skills } = values;

      const skillsCsv = Array.isArray(skills)
        ? skills.join(",")
        : String(skills || "");

      await PostService.createPersonalPost({
        title,
        description,
        skills: skillsCsv,
      });

      notification.success("Tạo profile post thành công!");
      form.resetFields();
      closeModal();
      onCreated?.();
    } catch (err) {
      // antd form đã hiển thị lỗi validate; error API sẽ do interceptor/toast lo
    }
  };

  return (
    <Modal
      title="Create Personal Profile"
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
          skills: "",
          name: currentUserName,
        }}
      >
        {/* chỉ hiển thị tên */}
        <Form.Item label="Full Name" name="name">
          <Input readOnly />
        </Form.Item>

        <Form.Item
          label="Title"
          name="title"
          rules={[{ required: true, message: "Vui lòng nhập title" }]}
        >
          <Input placeholder="VD: Tìm thành viên cho nhóm FE" />
        </Form.Item>

        <Form.Item
          label="Description"
          name="description"
          rules={[{ required: true, message: "Vui lòng nhập description" }]}
        >
          <TextArea rows={4} placeholder="Mô tả ngắn về nhu cầu/kinh nghiệm" />
        </Form.Item>

        <Form.Item label="Skills" name="skills">
          <Input placeholder="Node, Postgres" />
        </Form.Item>

        <div className="flex justify-between mt-4">
          <Button
            onClick={() => {
              form.resetFields();
              closeModal();
            }}
          >
            Cancel
          </Button>
          <Button type="primary" htmlType="submit">
            Publish Profile
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default CreatePersonalPostModal;
