import React from "react";
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
  const [form] = Form.useForm();

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

      notification.success("Tạo recruitment post thành công!");
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
          expiresAt: null, // Đặt giá trị mặc định cho expiresAt là null
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

        {/* Expires At Field */}
        <Form.Item
          label="Expires At"
          name="expiresAt"
          rules={[
            { required: true, message: "Vui lòng chọn ngày hết hạn" },
            {
              validator: (_, value) =>
                value && value.isAfter(moment())
                  ? Promise.resolve()
                  : Promise.reject("Ngày hết hạn phải lớn hơn ngày hiện tại!"),
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
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            className="inline-flex items-center rounded-lg !bg-[#FF7A00] px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:!opacity-90 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:opacity-60"
          >
            Publish Post
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default CreatePostModal;
