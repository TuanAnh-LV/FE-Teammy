import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Select, notification } from "antd";
import { TopicService } from "../../services/topic.service";
import { MajorService } from "../../services/major.service";
import { SemesterService } from "../../services/semester.service";
import { useTranslation } from "../../hook/useTranslation";

const { Option } = Select;

const TopicEditModal = ({ open, onClose, topic, onSuccess }) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [majors, setMajors] = useState([]);
  const [semesters, setSemesters] = useState([]);

  useEffect(() => {
    if (open) {
      const fetchMetadata = async () => {
        try {
          const [majorsRes, semestersRes] = await Promise.all([
            MajorService.getMajors(),
            SemesterService.list(),
          ]);
          setMajors(majorsRes?.data || []);
          setSemesters(semestersRes?.data || []);
        } catch {
          notification.error({
            message: t("failedLoadMetadata") || "Failed to load metadata",
          });
        }
      };
      fetchMetadata();
    }
  }, [open]);

  useEffect(() => {
    if (open && topic) {
      form.setFieldsValue({
        title: topic.title,
        description: topic.description,
        majorId: topic.majorId,
        semesterId: topic.semesterId,
        source: topic.source,
        status: topic.status,
        mentorEmails: topic.mentorEmails?.join(", ") || "",
      });
    }
  }, [open, topic, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      const payload = {
        ...values,
        mentorEmails: values.mentorEmails
          ? values.mentorEmails.split(",").map((e) => e.trim())
          : [],
      };

      await TopicService.updateTopic(topic.topicId, payload);
      notification.success({
        message: t("topicUpdated") || "Topic updated successfully",
      });
      onSuccess();
      onClose();
    } catch (err) {
      if (err.errorFields) {
        // Form validation error
        return;
      }
      notification.error({
        message: t("failedUpdateTopic") || "Failed to update topic",
        description: err?.response?.data?.message || err.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title={t("editTopic") || "Edit Topic"}
      open={open}
      onOk={handleSubmit}
      onCancel={handleCancel}
      confirmLoading={submitting}
      okText={t("save") || "Save"}
      cancelText={t("cancel") || "Cancel"}
      width={700}
      destroyOnClose
      okButtonProps={{
        className:
          "!bg-[#FF7A00] !text-white !border-none !rounded-md !px-4 !py-2 hover:!opacity-90",
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
          rules={[{ required: true, message: "Please input title" }]}
        >
          <Input placeholder="Enter topic title" />
        </Form.Item>

        <Form.Item
          label={t("description") || "Description"}
          name="description"
          rules={[{ required: true, message: "Please input description" }]}
        >
          <Input.TextArea rows={4} placeholder="Enter description" />
        </Form.Item>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            label={t("major") || "Major"}
            name="majorId"
            rules={[{ required: true, message: "Please select major" }]}
          >
            <Select placeholder="Select major">
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
            rules={[{ required: true, message: "Please select semester" }]}
          >
            <Select placeholder="Select semester">
              {semesters.map((sem) => (
                <Option key={sem.semesterId} value={sem.semesterId}>
                  {sem.season} {sem.year}
                </Option>
              ))}
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

        <Form.Item label={t("status") || "Status"} name="status">
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

export default TopicEditModal;
