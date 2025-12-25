import React, { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Row,
  Col,
  notification,
  Button,
} from "antd";
import { AdminService } from "../../services/admin.service";
import { MajorService } from "../../services/major.service";
import { SemesterService } from "../../services/semester.service";
import { useTranslation } from "../../hook/useTranslation";

const { Option } = Select;

export default function UserEditModal({ open, onClose, user, onSave }) {
  const [form] = Form.useForm();
  const [majors, setMajors] = useState([]);
  const [majorsLoading, setMajorsLoading] = useState(false);
  const [semesters, setSemesters] = useState([]);
  const [semestersLoading, setSemestersLoading] = useState(false);
  const { t } = useTranslation();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open && user) {
      const initial = { ...user };
      initial.displayName =
        user?.displayName ?? user?.name ?? initial.displayName;
      const majorId = user?.raw?.majorId ?? user?.majorId;
      if (majorId != null) initial.majorId = majorId;

      const gpa = user?.raw?.gpa ?? user?.gpa;
      if (gpa != null) initial.gpa = gpa;

      const semesterId = user?.raw?.semesterId ?? user?.semesterId;
      if (semesterId != null) initial.semesterId = semesterId;

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
          const currentMajor = user?.raw?.majorId ?? user?.majorId;
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
      } catch {
        // ignore errors
      } finally {
        if (mounted) setMajorsLoading(false);
      }
    };

    if (open) fetchMajors();
    return () => {
      mounted = false;
    };
  }, [open, user, form]);

  useEffect(() => {
    let mounted = true;
    const fetchSemesters = async () => {
      setSemestersLoading(true);
      try {
        const res = await SemesterService.list();
        const payload = res?.data ?? res;
        const list = Array.isArray(payload) ? payload : payload?.data ?? [];
        if (mounted) setSemesters(list);
      } catch {
        // ignore errors
      } finally {
        if (mounted) setSemestersLoading(false);
      }
    };

    if (open) fetchSemesters();
    return () => {
      mounted = false;
    };
  }, [open]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      const id = user?.raw?.userId || user?.key || user?.id;

      const serverPayload = {
        ...values,
      };

      try {
        const res = await AdminService.updateUser(id, serverPayload);
        const payload = res?.data ?? res;
        notification.success({
          message: t("userUpdatedSuccess") || "User updated successfully",
        });

        const latestIsActive =
          payload?.isActive !== undefined ? payload.isActive : values.isActive;

        const updated = {
          ...user,
          ...values,
          raw: payload,
          name: values.displayName ?? payload?.displayName ?? user?.name,
          displayName: payload?.displayName ?? values.displayName,
          email: payload?.email ?? values.email,
          phone: payload?.phone ?? values.phone,
          role: payload?.role ?? values.role,
          isActive: latestIsActive,
          studentCode: payload?.studentCode ?? values.studentCode,
          gpa: payload?.gpa ?? values.gpa,
        };

        try {
          const sel = majors.find((m) => (m.majorId ?? m.id) == values.majorId);
          if (sel) {
            updated.major = sel.majorName ?? sel.name ?? updated.major;
          } else if (payload && payload.majorId) {
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
          message: t("userUpdateFailed") || "Failed to update user",
          description:
            errorMessage || t("pleaseTryAgain") || "Please try again",
        });
      }
    } catch (err) {
      if (err?.errorFields) {
        return;
      }
    } finally {
      setSubmitting(false);
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
          <Button
            onClick={onClose}
            disabled={submitting}
            className="!border-gray-300 hover:!border-orange-400 hover:!text-orange-400 transition-all"
          >
            {t("cancel") || "Cancel"}
          </Button>
          <Button
            type="primary"
            loading={submitting}
            onClick={handleSubmit}
            className="!bg-[#FF7A00] hover:!opacity-90"
          >
            {t("saveChanges") || t("save") || "Save Changes"}
          </Button>
        </div>
      }
    >
      <Form layout="vertical" form={form}>
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

        <Row gutter={16}>
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
                <Option value="Moderator">Moderator</Option>
                <Option value="Mentor">Mentor</Option>
                <Option value="Student">Student</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label={t("status") || "Status"} name="isActive">
              <Select>
                <Option value={true}>{t("active") || "Active"}</Option>
                <Option value={false}>{t("suspended") || "Suspended"}</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item noStyle shouldUpdate={(prev, cur) => prev.role !== cur.role}>
          {({ getFieldValue }) => {
            const isStudent = getFieldValue("role") === "Student";

            return (
              <>
                <Row gutter={16}>
                  <Col span={isStudent ? 12 : 24}>
                    <Form.Item
                      label={t("major") || "Major"}
                      name="majorId"
                      rules={[
                        {
                          required: true,
                          message:
                            t("pleaseEnterMajor") || "Please enter major",
                        },
                      ]}
                    >
                      <Select
                        placeholder={
                          t("enterMajorPlaceholder") || "Select major"
                        }
                        loading={majorsLoading}
                        showSearch
                        optionFilterProp="children"
                        filterOption={(input, option) => {
                          const label = String(option?.children ?? "");
                          return label
                            .toLowerCase()
                            .includes(input.toLowerCase());
                        }}
                      >
                        {majors.map((m) => (
                          <Option
                            key={m.majorId ?? m.id}
                            value={m.majorId ?? m.id}
                          >
                            {m.majorName || m.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>

                  {isStudent && (
                    <Col span={12}>
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
                  )}
                </Row>

                {isStudent && (
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        label={t("gpa") || "GPA"}
                        name="gpa"
                        rules={[
                          {
                            required: true,
                            message: t("pleaseEnterGPA") || "Please enter GPA",
                          },
                          {
                            pattern: /^[0-9](\.[0-9]{1,2})?$/,
                            message:
                              t("gpaInvalid") || "GPA must be between 0 and 10",
                          },
                        ]}
                      >
                        <Input
                          placeholder={
                            t("enterGPAPlaceholder") || "Enter GPA (0 - 10)"
                          }
                          type="number"
                          step="0"
                          min="0"
                          max="10"
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        label={t("semester") || "Semester"}
                        name="semesterId"
                        rules={[
                          {
                            required: true,
                            message:
                              t("pleaseSelectSemester") ||
                              "Please select semester",
                          },
                        ]}
                      >
                        <Select
                          placeholder={t("selectSemester") || "Select semester"}
                          loading={semestersLoading}
                        >
                          {semesters.map((sem) => (
                            <Option
                              key={sem.semesterId ?? sem.id}
                              value={sem.semesterId ?? sem.id}
                            >
                              {[sem.season, sem.year]
                                .filter(Boolean)
                                .join(" ")}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                )}
              </>
            );
          }}
        </Form.Item>
      </Form>
    </Modal>
  );
}
