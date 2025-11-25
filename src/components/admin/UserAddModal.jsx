import React from "react";
import { Modal, Form, Input, Select, Row, Col, Divider } from "antd";
import { useTranslation } from "../../hook/useTranslation";

const { Option } = Select;

export default function UserAddModal({ open, onClose, onAdd }) {
  const [form] = Form.useForm();
  const { t } = useTranslation();

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      onAdd({
        key: Date.now(),
        ...values,
        status: values.status || "Active",
      });
      form.resetFields();
      onClose();
    });
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      okText={t("addUser") || "Add User"}
      centered
      width={720}
      title={
        <span className="font-bold text-lg text-gray-800">
          {t("addNewUserTitle") || "Add New User"}
        </span>
      }
      styles={{
        body: {
          padding: 0,
          background: "white",
          borderRadius: 12,
          maxHeight: "75vh",
          overflowY: "auto",
        },
      }}
      okButtonProps={{
        className:
          "!bg-[#FF7A00] !text-white !border-none !rounded-md !px-6 !py-5 hover:!opacity-90 transition-all",
      }}
      cancelButtonProps={{
        className:
          "!border-gray-300 hover:!border-orange-400 hover:!text-orange-400 transition-all !py-5",
      }}
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
              label={t("fullName") || "Full Name"}
              name="name"
              rules={[
                {
                  required: true,
                  message: t("pleaseEnterFullName") || "Please enter full name",
                },
              ]}
            >
              <Input
                placeholder={t("enterFullNamePlaceholder") || "Enter full name"}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label={t("email") || "Email"}
              name="email"
              rules={[{ type: "email", required: true }]}
            >
              <Input
                placeholder={t("enterEmailPlaceholder") || "Enter email"}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label={t("phone") || "Phone"} name="phone">
              <Input
                placeholder={t("enterPhonePlaceholder") || "Enter phone number"}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label={t("role") || "Role"}
              name="role"
              rules={[
                {
                  required: true,
                  message: t("selectARole") || "Select a role",
                },
              ]}
            >
              <Select placeholder={t("selectRole") || "Select user role"}>
                <Option value="Admin">Admin</Option>
                <Option value="Mentor">Mentor</Option>
                <Option value="Student">Student</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label={t("major") || "Major"} name="major">
              <Select
                placeholder={t("enterMajorPlaceholder") || "Select major"}
              >
                <Option value="Engineering">Engineering</Option>
                <Option value="Business">Business</Option>
                <Option value="IT">IT</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label={t("major") || "Major"} name="major">
              <Input
                placeholder={t("enterMajorPlaceholder") || "Enter major"}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label={t("studentCode") || "Student Code"}
              name="studentCode"
            >
              <Input
                placeholder={
                  t("enterStudentCodePlaceholder") ||
                  "Enter student code (if Student)"
                }
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Status" name="status" initialValue="Active">
              <Select placeholder="Select status">
                <Option value="Active">Active</Option>
                <Option value="Inactive">Inactive</Option>
                <Option value="Suspended">Suspended</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}
