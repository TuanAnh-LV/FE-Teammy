import React, { useState } from "react";
import { Modal, Form, Input, Select, Row, Col, notification } from "antd";
import { useTranslation } from "../../hook/useTranslation";
import { AdminService } from "../../services/admin.service";

const { Option } = Select;

export default function UserAddModal({ open, onClose, onAdd, majorList }) {
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      // build payload đúng với API POST /api/users/admin
      const payload = {
        email: values.email,
        displayName: values.name,
        role: values.role,
        studentCode: values.studentCode || null,
        gender: values.gender || null, // hiện chưa có field gender, có thể bỏ
        majorId: values.majorId || null,
      };

      const res = await AdminService.createUser(payload);
      const created = res?.data ?? res;

      // map data trả về để hiển thị trong bảng
      const majorName =
        created.majorName ||
        majorList?.find((m) => m.majorId === payload.majorId)?.majorName ||
        "";

      const newUser = {
        key: created.userId || created.id || Date.now(),
        name: created.displayName || payload.displayName,
        email: created.email || payload.email,
        role:
          (created.role &&
            String(created.role).charAt(0).toUpperCase() +
              String(created.role).slice(1)) ||
          payload.role,
        phone: created.phone || values.phone || "",
        major: majorName,
        studentCode: created.studentCode || payload.studentCode || null,
        avatarUrl: created.avatarUrl || null,
        displayName: created.displayName || payload.displayName,
        majorId: created.majorId || payload.majorId || null,
        isActive:
          typeof created.isActive === "boolean"
            ? created.isActive
            : values.status === (t("Active") || "Active"),
        raw: created,
      };

      onAdd?.(newUser);
      notification.success({
        message: t("addUserSuccess") || "User created successfully",
      });

      form.resetFields();
      onClose();
    } catch (err) {
      if (err?.errorFields) {
        // lỗi validate form – bỏ qua
        return;
      }
      notification.error({
        message: t("addUserFailed") || "Failed to create user",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      okText={t("addUser") || "Add User"}
      confirmLoading={submitting}
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
            <Form.Item
              label={t("major") || "Major"}
              name="majorId"
              rules={[
                {
                  required: true,
                  message: t("selectMajor") || "Select a major",
                },
              ]}
            >
              <Select
                placeholder={t("enterMajorPlaceholder") || "Select major"}
              >
                {majorList?.map((m) => (
                  <Option key={m.majorId} value={m.majorId}>
                    {m.majorName}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
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
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label={t("status") || "Status"}
              name="status"
              initialValue={t("Active") || "Active"}
            >
              <Select placeholder={t("selectStatus") || "Select status"}>
                <Option value={t("Active") || "Active"}>
                  {t("Active") || "Active"}
                </Option>
                <Option value={t("Suspended") || "Suspended"}>
                  {t("Suspended") || "Suspended"}
                </Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}
