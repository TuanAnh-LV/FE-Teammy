import React, { useEffect } from "react";
import { Modal, Form, Input, Select, Row, Col, Divider } from "antd";
const { Option } = Select;

export default function UserEditModal({ open, onClose, user, onSave }) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open && user) form.setFieldsValue(user);
  }, [open, user]);

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      onSave({ ...user, ...values });
      onClose();
    });
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      centered
      width={720}
      title={
        <span className="font-bold text-lg text-gray-800">
          Edit User Information
        </span>
      }
      footer={
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="!border !border-gray-300 !text-gray-700 !bg-white !rounded-md !px-3 !py-2
                 hover:!border-orange-400 hover:!text-orange-400 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="!bg-[#FF7A00] !text-white !border-none !rounded-md !px-3 !py-2 hover:!opacity-90"
          >
            Save Changes
          </button>
        </div>
      }
    >
      <Form
        layout="vertical"
        form={form}
        style={{
          background: "white",
          borderRadius: "12px",
          padding: "24px 20px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Full Name"
              name="name"
              rules={[{ required: true, message: "Please enter full name" }]}
            >
              <Input placeholder="Enter full name" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Email"
              name="email"
              rules={[{ type: "email", required: true }]}
            >
              <Input placeholder="Enter email" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Phone" name="phone">
              <Input placeholder="Enter phone number" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Role" name="role">
              <Select>
                <Option value="Admin">Admin</Option>
                <Option value="Mentor">Mentor</Option>
                <Option value="Student">Student</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Major" name="majoy">
              <Select>
                <Option value="Engineering">Engineering</Option>
                <Option value="Business">Business</Option>
                <Option value="IT">IT</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Major" name="major">
              <Input placeholder="Enter major" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Status" name="status">
              <Select>
                <Option value="Active">Active</Option>
                <Option value="Inactive">Inactive</Option>
                <Option value="Suspended">Suspended</Option>
              </Select>
            </Form.Item>
          </Col>
          {user?.role === "Student" && (
            <Col span={12}>
              <Form.Item label="Student Code" name="studentCode">
                <Input placeholder="Enter student code" />
              </Form.Item>
            </Col>
          )}
        </Row>
      </Form>
    </Modal>
  );
}
