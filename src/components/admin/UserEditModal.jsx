import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Select, Row, Col, notification } from "antd";
import { AdminService } from "../../services/admin.service";
import { MajorService } from "../../services/major.service";
import { useTranslation } from "../../hook/useTranslation";

const { Option } = Select;

export default function UserEditModal({ open, onClose, user, onSave }) {
  const [form] = Form.useForm();
  const [majors, setMajors] = useState([]);
  const [majorsLoading, setMajorsLoading] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    if (open && user) {
      const initial = { ...user };
      // prefer displayName for API
      initial.displayName =
        user?.displayName ?? user?.name ?? initial.displayName;
      const majorId = user?.raw?.majorId ?? user?.majorId ?? user?.major;
      if (majorId) initial.majorId = majorId;

      // Set isActive from server data
      if (user?.raw?.isActive !== undefined) {
        initial.isActive = user.raw.isActive;
      } else if (user?.isActive !== undefined) {
        initial.isActive = Boolean(user.isActive);
      } else if (user?.status) {
        initial.isActive = user.status === "Active";
      }

      form.setFieldsValue(initial);
    } else {
      form.resetFields();
    }
  }, [open, user, form]);

  useEffect(() => {
    let mounted = true;
    const fetchMajors = async () => {
      setMajorsLoading(true);
      try {
        const res = await MajorService.getMajors();
        const payload = res?.data ?? res;
        const list = Array.isArray(payload) ? payload : payload?.data ?? [];
        if (mounted) setMajors(list);

        if (mounted && open && user) {
          const currentMajor =
            user?.raw?.majorId ?? user?.majorId ?? user?.major;
          if (!currentMajor && user?.major) {
            const found = list.find(
              (m) =>
                (m.majorName && m.majorName === user.major) ||
                (m.name && m.name === user.major)
            );
            if (found)
              form.setFieldsValue({
                ...user,
                majorId: found.majorId ?? found.id,
              });
          }
        }
      } catch (e) {
        console.error("Failed to load majors", e);
      } finally {
        if (mounted) setMajorsLoading(false);
      }
    };

    if (open) fetchMajors();
    return () => {
      mounted = false;
    };
  }, [open, user, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const id = user?.raw?.userId || user?.key || user?.id;

      // Send values directly with isActive boolean
      const serverPayload = {
        ...values,
      };

      try {
        const res = await AdminService.updateUser(id, serverPayload);
        const payload = res?.data ?? res;
        notification.success({
          message: t("userUpdatedSuccess") || "User updated successfully",
        });

        // Use form values if server doesn't return isActive
        const latestIsActive =
          payload?.isActive !== undefined ? payload.isActive : values.isActive;

        const updated = {
          ...user,
          ...values,
          raw: payload,
          name: values.displayName ?? payload?.displayName ?? user?.name,
          // Map server response fields correctly
          displayName: payload?.displayName ?? values.displayName,
          email: payload?.email ?? values.email,
          phone: payload?.phone ?? values.phone,
          role: payload?.role ?? values.role,
          isActive: latestIsActive,
          studentCode: payload?.studentCode ?? values.studentCode,
        };

        // Keep UI-friendly major value (name) while backend receives majorId
        try {
          const sel = majors.find((m) => (m.majorId ?? m.id) == values.majorId);
          if (sel) {
            updated.major = sel.majorName ?? sel.name ?? updated.major;
          } else if (payload && payload.majorId) {
            // Try to find major name from majorId in response
            const foundMajor = majors.find(
              (m) => (m.majorId ?? m.id) == payload.majorId
            );
            updated.major = foundMajor
              ? foundMajor.majorName ?? foundMajor.name
              : payload.majorId;
          }
        } catch {
          // ignore mapping errors
        }

        onSave?.(updated);
        onClose();
      } catch (err) {
        console.error(err);
        notification.error({
          message: t("userUpdateFailed") || "Failed to update user",
        });
      }
    } catch {
      // validation errors - ignore
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      centered
      width={720}
      title={
        <span className="font-bold text-lg text-gray-800">
          {t("editUserTitle") || "Edit User Information"}
        </span>
      }
      footer={
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="border border-gray-300 text-gray-700 bg-white rounded-md px-3 py-2"
          >
            {t("cancel") || "Cancel"}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="bg-[#FF7A00] text-white border-none rounded-md px-3 py-2 hover:opacity-90"
          >
            {t("saveChanges") || t("save") || "Save Changes"}
          </button>
        </div>
      }
    >
      <Form layout="vertical" form={form}>
        {/* Hàng 1: Display Name + Email */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label={t("displayName") || "Display Name"}
              name="displayName"
              rules={[
                {
                  required: true,
                  message:
                    t("pleaseEnterDisplayName") || "Please enter display name",
                },
              ]}
            >
              <Input
                placeholder={
                  t("enterDisplayNamePlaceholder") || "Enter display name"
                }
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label={t("email") || "Email"}
              name="email"
              rules={[
                {
                  required: true,
                  message: t("pleaseEnterEmail") || "Please enter email",
                },
                {
                  type: "email",
                  message: t("invalidEmail") || "Invalid email",
                },
              ]}
            >
              <Input
                placeholder={t("enterEmailPlaceholder") || "Enter email"}
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Hàng 2: Phone + Role */}
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
              <Select>
                <Option value="Admin">Admin</Option>
                <Option value="Mentor">Mentor</Option>
                <Option value="Student">Student</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {/* Hàng 3: Major + Status */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label={t("major") || "Major"} name="majorId">
              <Select
                placeholder={t("enterMajorPlaceholder") || "Select major"}
                loading={majorsLoading}
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.children || "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              >
                {majors.map((m) => (
                  <Option key={m.majorId ?? m.id} value={m.majorId ?? m.id}>
                    {m.majorName || m.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label={t("status") || "Status"} name="isActive">
              <Select>
                <Option value={true}>{t("active") || "Active"}</Option>
                <Option value={false}>Suspended</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {/* Student Code: only when role = Student */}
        <Form.Item noStyle shouldUpdate={(prev, cur) => prev.role !== cur.role}>
          {({ getFieldValue }) =>
            getFieldValue("role") === "Student" ? (
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label={t("studentCode") || "Student Code"}
                    name="studentCode"
                  >
                    <Input
                      placeholder={
                        t("enterStudentCodePlaceholder") || "Enter student code"
                      }
                    />
                  </Form.Item>
                </Col>
              </Row>
            ) : null
          }
        </Form.Item>
      </Form>
    </Modal>
  );
}
