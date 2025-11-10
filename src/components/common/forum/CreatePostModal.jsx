import React from "react";
import { Modal, Input, Button, Form, InputNumber, message } from "antd";
import { PostService } from "../../../services/post.service";

const { TextArea } = Input;

/**
 * Props:
 * - isOpen, closeModal
 * - onCreated?: () => void
 * - defaultGroupId?: string (nếu có thể auto-fill từ membership)
 */
const CreatePostModal = ({ isOpen, closeModal, onCreated, defaultGroupId }) => {
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    try {
      const { groupId, title, description, position_needed, limit } =
        await form.validateFields();

      await PostService.createRecruitmentPost({
        groupId,
        title,
        description,
        position_needed,
        limit,
      });

      message.success("Tạo recruitment post thành công!");
      form.resetFields();
      closeModal();
      onCreated?.();
    } catch {
      /* validate/API error handled elsewhere */
    }
  };

  return (
    <Modal
      title="Create Recruitment Post"
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
          limit: 1,
        }}
      >
        <Form.Item
          label="Group ID"
          name="groupId"
          rules={[{ required: true, message: "Vui lòng nhập groupId" }]}
        >
          <Input placeholder="39181a00-c01e-45bd-8fd6-2bf976b6afc0" />
        </Form.Item>

        <Form.Item
          label="Title"
          name="title"
          rules={[{ required: true, message: "Vui lòng nhập title" }]}
        >
          <Input placeholder="VD: Tuyển FE cho project" />
        </Form.Item>

        <Form.Item
          label="Description"
          name="description"
          rules={[{ required: true, message: "Vui lòng nhập description" }]}
        >
          <TextArea rows={4} placeholder="Mô tả yêu cầu, stack..." />
        </Form.Item>

        <Form.Item
          label="Position Needed"
          name="position_needed"
          rules={[
            { required: true, message: "Vui lòng nhập vị trí cần tuyển" },
          ]}
        >
          <Input placeholder="VD: Git, Azure" />
        </Form.Item>

        <Form.Item
          label="Limit"
          name="limit"
          rules={[{ required: true, message: "Vui lòng nhập số lượng" }]}
        >
          <InputNumber min={1} style={{ width: "100%" }} />
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
            Publish Post
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default CreatePostModal;
