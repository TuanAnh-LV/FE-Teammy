import React, { useState } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Row,
  Col,
  notification,
  InputNumber,
} from "antd";
import { useTranslation } from "../../hook/useTranslation";
import { AdminService } from "../../services/admin.service";

const { Option } = Select;

export default function UserAddModal({ open, onClose, onAdd, majorList }) {
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const [submitting, setSubmitting] = useState(false);

  const handleRoleChange = (role) => {
    // Nếu không phải Student => xóa các field chỉ dành cho Student
    if (role !== "Student") {
      form.setFieldsValue({ studentCode: undefined, gpa: undefined });
      form.setFields([
        { name: "studentCode", errors: [] },
        { name: "gpa", errors: [] },
      ]);
    }

    // Admin không cần major => xóa major
    if (role === "Admin") {
      form.setFieldsValue({ majorId: undefined });
      form.setFields([{ name: "majorId", errors: [] }]);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      const isStudent = values.role === "Student";
      const needMajor = ["Student", "Mentor", "Moderator"].includes(
        values.role
      );

      const payload = {
        email: values.email,
        displayName: values.name,
        role: values.role,

        // Chỉ Student mới có studentCode + gpa
        studentCode: isStudent ? values.studentCode || null : null,
        gpa: isStudent
          ? typeof values.gpa === "number"
            ? values.gpa
            : null
          : null,

        // Student/Mentor/Moderator có major
        majorId: needMajor ? values.majorId || null : null,
      };

      const res = await AdminService.createUser(payload);
      const created = res?.data ?? res;

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
        major: majorName,
        studentCode: created.studentCode || payload.studentCode || null,
        gpa: created.gpa ?? payload.gpa ?? null,
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
      if (err?.errorFields) return;

      const errorMessage =
        err?.response?.data?.message || err?.response?.data || "";
      const normalizedError = String(errorMessage).toLowerCase();

      if (normalizedError.includes("email already exists")) {
        form.setFields([
          {
            name: "email",
            errors: [t("emailAlreadyExists") || "Email already exists."],
          },
        ]);
        return;
      }

      if (normalizedError.includes("studentcode already exists")) {
        form.setFields([
          {
            name: "studentCode",
            errors: [
              t("studentCodeAlreadyExists") || "StudentCode already exists.",
            ],
          },
        ]);
        return;
      }

      notification.error({
        message: t("addUserFailed") || "Failed to create user",
        description: errorMessage || t("pleaseTryAgain") || "Please try again",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      centered
      width={760}
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
      onOk={handleSubmit}
      okText={t("addUser") || "Add User"}
      confirmLoading={submitting}
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
        style={{ background: "white", borderRadius: 12, padding: "22px 20px" }}
      >
        {/* Row 1 */}
        <Row gutter={16}>
          <Col xs={24} md={12}>
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

          <Col xs={24} md={12}>
            <Form.Item
              label={t("email") || "Email"}
              name="email"
              rules={[
                {
                  type: "email",
                  required: true,
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

        {/* Row 2 */}
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              label={t("role") || "Role"}
              name="role"
              initialValue="Student"
              rules={[
                {
                  required: true,
                  message: t("selectARole") || "Select a role",
                },
              ]}
            >
              <Select
                onChange={handleRoleChange}
                placeholder={t("selectRole") || "Select user role"}
              >
                <Option value="Admin">Admin</Option>
                <Option value="Moderator">Moderator</Option>
                <Option value="Mentor">Mentor</Option>
                <Option value="Student">Student</Option>
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
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

        {/* Major: hiện cho Student/Mentor/Moderator */}
        <Form.Item noStyle shouldUpdate={(prev, cur) => prev.role !== cur.role}>
          {({ getFieldValue }) => {
            const role = getFieldValue("role");
            const showMajor = ["Student", "Mentor", "Moderator"].includes(role);
            if (!showMajor) return null;

            return (
              <Row gutter={16}>
                <Col xs={24} md={12}>
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
              </Row>
            );
          }}
        </Form.Item>

        {/* Student-only: Student Code + GPA */}
        <Form.Item noStyle shouldUpdate={(prev, cur) => prev.role !== cur.role}>
          {({ getFieldValue }) => {
            const isStudent = getFieldValue("role") === "Student";
            if (!isStudent) return null;

            return (
              <>
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label={t("studentCode") || "Student Code"}
                      name="studentCode"
                      rules={[
                        {
                          required: true,
                          message:
                            t("pleaseEnterStudentCode") ||
                            "Please enter student code",
                        },
                      ]}
                    >
                      <Input
                        placeholder={
                          t("enterStudentCodePlaceholder") ||
                          "Enter student code"
                        }
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12}>
                    <Form.Item
                      label={t("gpa") || "GPA"}
                      name="gpa"
                      rules={[
                        {
                          required: true,
                          message: t("pleaseEnterGPA") || "Please enter GPA",
                        },
                        {
                          type: "number",
                          min: 0,
                          max: 10,
                          message:
                            t("gpaInvalid") || "GPA must be between 0 and 10",
                        },
                      ]}
                    >
                      <InputNumber
                        style={{ width: "100%" }}
                        placeholder={
                          t("enterGPAPlaceholder") || "Enter GPA (0 - 10)"
                        }
                        min={0}
                        max={10}
                        step={0.01}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </>
            );
          }}
        </Form.Item>
      </Form>
    </Modal>
  );
}
