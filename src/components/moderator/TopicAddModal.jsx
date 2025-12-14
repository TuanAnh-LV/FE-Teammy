import React, { useState, useEffect, useMemo } from "react";
import { Modal, Form, Input, Select, notification } from "antd";
import { TopicService } from "../../services/topic.service";
import { MajorService } from "../../services/major.service";
import { SemesterService } from "../../services/semester.service";
import { useTranslation } from "../../hook/useTranslation";

const { Option } = Select;

const TopicAddModal = ({ open, onClose, onSuccess }) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [majors, setMajors] = useState([]);
  const [semesters, setSemesters] = useState([]);

  const activeSemester = useMemo(
    () => semesters.find((s) => s.isActive),
    [semesters]
  );

  useEffect(() => {
    if (!open) return;

    const fetchMetadata = async () => {
      try {
        const [majorsRes, semestersRes] = await Promise.all([
          MajorService.getMajors(),
          SemesterService.list(),
        ]);

        const majorsData = majorsRes?.data || [];
        const semestersData = semestersRes?.data || [];

        setMajors(majorsData);
        setSemesters(semestersData);

        // ✅ auto set active semester nếu chưa chọn
        const current = form.getFieldValue("semesterId");
        const active = semestersData.find((s) => s.isActive);
        if (!current && active?.semesterId) {
          form.setFieldsValue({ semesterId: active.semesterId });
        }
      } catch {
        notification.error({
          message: t("failedLoadMetadata") || "Failed to load metadata",
        });
      }
    };

    fetchMetadata();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // ✅ chặn tạo topic vào kỳ chưa active (an toàn)
      const selectedSemester = semesters.find(
        (s) => s.semesterId === values.semesterId
      );

      if (!selectedSemester?.isActive) {
        notification.error({
          message: t("semesterNotActive") || "Semester is not active",
          description:
            t("onlyActiveSemesterAllowed") ||
            "You can only create topics for the active semester. Please activate this semester first.",
        });
        return;
      }

      setSubmitting(true);

      const payload = {
        ...values,
        mentorEmails: values.mentorEmails
          ? values.mentorEmails
              .split(/[,;|\n]+/g)
              .map((e) => e.trim())
              .filter(Boolean)
          : [],
      };

      await TopicService.createTopic(payload);

      notification.success({
        message: t("topicCreated") || "Topic created successfully",
      });

      form.resetFields();

      // set lại active semester sau reset cho tiện
      if (activeSemester?.semesterId) {
        form.setFieldsValue({ semesterId: activeSemester.semesterId });
      }

      onSuccess?.();
      onClose?.();
    } catch (err) {
      if (err?.errorFields) return;

      notification.error({
        message: t("failedCreateTopic") || "Failed to create topic",
        description: err?.response?.data?.message || err?.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    // set lại active semester sau reset cho tiện
    if (activeSemester?.semesterId) {
      form.setFieldsValue({ semesterId: activeSemester.semesterId });
    }
    onClose?.();
  };

  return (
    <Modal
      title={t("createTopic") || "Create Topic"}
      open={open}
      onOk={handleSubmit}
      onCancel={handleCancel}
      confirmLoading={submitting}
      okText={t("create") || "Create"}
      cancelText={t("cancel") || "Cancel"}
      width={700}
      destroyOnClose
      okButtonProps={{
        className:
          "!bg-[#FF7A00] !text-white !border-none !rounded-md !px-4 !py-2 hover:!opacity-90",
        disabled: !activeSemester, // nếu chưa load được semester active thì disable tạo
      }}
      cancelButtonProps={{
        className:
          "!border-gray-300 hover:!border-orange-400 hover:!text-orange-400 transition-all !py-2",
      }}
    >
      <Form form={form} layout="vertical" className="mt-4">
        <Form.Item
          label={t("title") || "Title"}
          name="title"
          rules={[
            {
              required: true,
              message: t("pleaseInputTitle") || "Please input title",
            },
          ]}
        >
          <Input placeholder={t("enterTopicTitle") || "Enter topic title"} />
        </Form.Item>

        <Form.Item
          label={t("description") || "Description"}
          name="description"
          rules={[
            {
              required: true,
              message:
                t("pleaseInputDescription") || "Please input description",
            },
          ]}
        >
          <Input.TextArea
            rows={4}
            placeholder={t("enterDescription") || "Enter description"}
          />
        </Form.Item>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            label={t("major") || "Major"}
            name="majorId"
            rules={[
              {
                required: true,
                message: t("pleaseSelectMajor") || "Please select major",
              },
            ]}
          >
            <Select placeholder={t("selectMajor") || "Select major"}>
              {majors.map((major) => (
                <Option key={major.majorId} value={major.majorId}>
                  {major.majorName}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label={t("semester") || "Semester"}
            name="semesterId"
            rules={[
              {
                required: true,
                message: t("pleaseSelectSemester") || "Please select semester",
              },
            ]}
          >
            <Select
              placeholder={t("selectSemester") || "Select semester"}
              // nếu chỉ muốn cho chọn active: có thể set disabled luôn nếu chỉ có 1 active
            >
              {semesters.map((sem) => {
                const label = `${sem.season} ${sem.year}${
                  sem.isActive ? "" : " (Inactive)"
                }`;

                return (
                  <Option
                    key={sem.semesterId}
                    value={sem.semesterId}
                    disabled={!sem.isActive} // ✅ disable kỳ chưa active
                  >
                    {label}
                  </Option>
                );
              })}
            </Select>
          </Form.Item>
        </div>

        <Form.Item
          label={t("source") || "Source"}
          name="source"
          rules={[
            {
              required: true,
              message: t("pleaseImportSource") || "Please import source",
            },
          ]}
        >
          <Input placeholder="https://example.com" />
        </Form.Item>

        <Form.Item
          label={t("status") || "Status"}
          name="status"
          initialValue="open"
        >
          <Select>
            <Option value="open">Open</Option>
            <Option value="closed">Closed</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label={t("mentorEmails") || "Mentor Emails"}
          name="mentorEmails"
          rules={[
            {
              required: true,
              message:
                t("pleaseImportMailMentor") || "Please import mentor emails",
            },
          ]}
        >
          <Input placeholder="email1@example.com, email2@example.com" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TopicAddModal;
