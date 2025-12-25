import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Select, notification, Upload, Button } from "antd";
import { UploadOutlined } from "@ant-design/icons";
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
  const [topicDetail, setTopicDetail] = useState(null);
  const [existingTopics, setExistingTopics] = useState([]);

  const normalizeTitle = (value = "") =>
    value.trim().replace(/\s+/g, " ").toLowerCase();

  const parseMentorEmails = (value = "") =>
    value
      .split(/[,;|\n]+/g)
      .map((email) => email.trim())
      .filter(Boolean);

  const validateMentorEmails = (_, value) => {
    const emails = parseMentorEmails(value);
    if (emails.length === 0) return Promise.resolve();
    const invalid = emails.filter(
      (email) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    );
    if (invalid.length === 0) return Promise.resolve();
    return Promise.reject(
      new Error(
        t("invalidMentorEmails") || "Please enter valid mentor email addresses."
      )
    );
  };

  const validateTitle = (_, value) => {
    if (!value || !value.trim()) {
      return Promise.resolve();
    }

    const currentTopicId = topicDetail?.topicId || topic?.topicId;
    const currentSemesterId = form.getFieldValue("semesterId");

    if (!currentSemesterId) {
      return Promise.resolve();
    }

    const normalizedTitle = normalizeTitle(value);
    const duplicate = existingTopics.find((item) => {
      const itemId = item.topicId || item.id;
      const itemSemesterId = item.semesterId;
      const itemTitle = item.title || item.topicName || item.name || "";
      return (
        String(itemSemesterId) === String(currentSemesterId) &&
        normalizeTitle(itemTitle) === normalizedTitle &&
        String(itemId) !== String(currentTopicId)
      );
    });

    if (duplicate) {
      return Promise.reject(
        new Error(
          t("topicTitleExists") ||
            "Topic title already exists in this semester."
        )
      );
    }

    return Promise.resolve();
  };

  useEffect(() => {
    if (!open) return;

    (async () => {
      try {
        const [majorsRes, semestersRes, topicsRes] = await Promise.all([
          MajorService.getMajors(),
          SemesterService.list(),
          TopicService.getTopics({ pageSize: 1000 }),
        ]);
        setMajors(majorsRes?.data || []);
        setSemesters(semestersRes?.data || []);
        const topicsData = topicsRes?.data?.data || topicsRes?.data || [];
        setExistingTopics(Array.isArray(topicsData) ? topicsData : []);
      } catch {
        notification.error({
          message: t("failedLoadMetadata") || "Failed to load metadata",
        });
      }
    })();
  }, [open]);

  useEffect(() => {
    if (!open || !topic?.topicId) return;

    (async () => {
      try {
        const res = await TopicService.getTopicDetail(topic.topicId);
        setTopicDetail(res?.data ?? res);
      } catch {
        setTopicDetail(topic);
      }
    })();
  }, [open, topic?.topicId]);

  useEffect(() => {
    const data = topicDetail || topic;
    if (!open || !data) return;

    const mentorEmailsArr = Array.isArray(data.mentorEmails)
      ? data.mentorEmails
      : Array.isArray(data.mentors)
      ? data.mentors.map((m) => m.email || m.mentorEmail).filter(Boolean)
      : [];

    form.setFieldsValue({
      title: data.title,
      description: data.description,
      majorId: data.majorId,
      semesterId: data.semesterId,
      status: data.status,
      mentorEmails: mentorEmailsArr.join(", "),
    });

    if (data.registrationFile && typeof data.registrationFile === "object") {
      const fileName = data.registrationFile.fileName || "Existing File";
      const fileUrl = data.registrationFile.fileUrl;

      if (fileUrl) {
        form.setFieldsValue({
          registrationFile: [
            {
              uid: "-1",
              name: fileName,
              status: "done",
              url: fileUrl,
            },
          ],
        });
      }
    }
  }, [open, topicDetail, topic, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const currentTopicId = topicDetail?.topicId || topic?.topicId;
      const normalizedTitle = normalizeTitle(values.title);
      const duplicate = existingTopics.find((item) => {
        const itemId = item.topicId || item.id;
        const itemSemesterId = item.semesterId;
        const itemTitle = item.title || item.topicName || item.name || "";
        return (
          String(itemSemesterId) === String(values.semesterId) &&
          normalizeTitle(itemTitle) === normalizedTitle &&
          String(itemId) !== String(currentTopicId)
        );
      });

      if (duplicate) {
        form.setFields([
          {
            name: "title",
            errors: [
              t("topicTitleExists") ||
                "Topic title already exists in this semester.",
            ],
          },
        ]);
        return;
      }

      setSubmitting(true);

      const formData = new FormData();

      formData.append("SemesterId", values.semesterId);
      formData.append("MajorId", values.majorId);
      formData.append("Title", values.title);
      formData.append("Description", values.description);
      formData.append("Status", values.status || "open");

      const mentorEmails = parseMentorEmails(values.mentorEmails);
      mentorEmails.forEach((email) => {
        formData.append("MentorEmails", email);
      });

      if (values.registrationFile?.length > 0) {
        const file = values.registrationFile[0];
        if (file.originFileObj) {
          formData.append("RegistrationFile", file.originFileObj);
        }
      }

      await TopicService.updateTopic(topic.topicId, formData);
      notification.success({
        message: t("topicUpdated") || "Topic updated successfully",
      });
      onSuccess();
      onClose();
    } catch (err) {
      if (err.errorFields) {
        return;
      }
      const apiMessage = err?.response?.data?.message || err?.message;
      if (
        apiMessage &&
        /title/i.test(apiMessage) &&
        /exist|already/i.test(apiMessage)
      ) {
        form.setFields([{ name: "title", errors: [apiMessage] }]);
        return;
      }
      notification.error({
        message: t("failedUpdateTopic") || "Failed to update topic",
        description: apiMessage,
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
      centered
      title={t("editTopic") || "Edit Topic"}
      open={open}
      onOk={handleSubmit}
      onCancel={handleCancel}
      confirmLoading={submitting}
      okText={t("save") || "Save"}
      cancelText={t("cancel") || "Cancel"}
      width="min(700px, 92vw)"
      styles={{
        content: { padding: 20, borderRadius: 14 },
        body: {
          padding: 10,
          maxHeight: "calc(100vh - 140px)",
          overflowY: "auto",
        },
      }}
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
          rules={[
            {
              required: true,
              message: t("pleaseInputTitle") || "Please input title",
            },
            { validator: validateTitle },
          ]}
          validateTrigger={["onBlur", "onChange"]}
        >
          <Input placeholder="Enter topic title" />
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
            <Select
              placeholder="Select semester"
              onChange={() => form.validateFields(["title"])}
            >
              {semesters.map((sem) => (
                <Option key={sem.semesterId} value={sem.semesterId}>
                  {sem.season} {sem.year}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </div>

        <Form.Item label={t("status") || "Status"} name="status">
          <Select>
            <Option value="open">{t("open") || "Open"}</Option>
            <Option value="closed">{t("closed") || "Closed"}</Option>
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
            { validator: validateMentorEmails },
          ]}
        >
          <Input placeholder="email1@example.com, email2@example.com" />
        </Form.Item>

        <Form.Item
          label={t("registrationFile") || "Registration File"}
          name="registrationFile"
          valuePropName="fileList"
          getValueFromEvent={(e) => {
            if (Array.isArray(e)) {
              return e;
            }
            return e?.fileList;
          }}
        >
          <Upload
            maxCount={1}
            beforeUpload={() => false}
            accept=".pdf,.doc,.docx,.xls,.xlsx"
          >
            <Button icon={<UploadOutlined />}>
              {t("clickToUpload") || "Click to Upload"}
            </Button>
          </Upload>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TopicEditModal;
