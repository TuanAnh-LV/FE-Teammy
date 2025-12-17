import React, { useEffect, useState, useMemo } from "react";
import { Table, Button, Tag, notification } from "antd";
import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { TopicService } from "../../../services/topic.service";
import { useTranslation } from "../../../hook/useTranslation";

export default function ImportStep3PreviewTopic({
  uploadedTopics,
  setMappedTopics,
  setCurrentStep,
  validationResult,
  originalFile,
}) {
  const { t } = useTranslation();
  const [previewData, setPreviewData] = useState([]);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    if (!validationResult?.rows) return;

    const mapped = validationResult.rows.map((row, i) => {
      const idx = row.rowNumber ? row.rowNumber - 1 : i;
      const u = uploadedTopics?.[idx] || {};

      // nếu sau này BE trả row.data thì ưu tiên dùng
      const data = row.data || u;

      const title = data.title || "";
      const semesterCode = data.semesterCode || "-";
      const majorName = data.majorName || "-";
      const statusRaw = data.status || "open";
      const status = String(statusRaw).toLowerCase();

      const mentorEmailsArr = Array.isArray(data.mentorEmails)
        ? data.mentorEmails
        : data.mentorEmails
        ? [String(data.mentorEmails)]
        : [];

      const mentorEmails = mentorEmailsArr.length
        ? mentorEmailsArr.join(", ")
        : "-";

      let statusLabel = row.isValid ? "Valid" : "Error";
      const issues = [];

      row.columns?.forEach((col) => {
        if (!col.isValid && col.errorMessage) {
          issues.push(`${col.column}: ${col.errorMessage}`);
        }
      });

      if (Array.isArray(row.messages) && row.messages.length > 0) {
        issues.push(...row.messages);
      }

      if (issues.length > 0 && row.isValid) statusLabel = "Warning";

      return {
        key: i,
        row: row.rowNumber ?? i + 1,
        title,
        semesterCode,
        majorName,
        mentorEmails,
        status,
        statusLabel,
        issues,
      };
    });

    setPreviewData(mapped);
    setMappedTopics?.(mapped);
  }, [validationResult, uploadedTopics, setMappedTopics]);

  const handleImport = async () => {
    if (!originalFile) {
      notification.error({
        message: t("error") || "Error",
        description: t("noFileFound") || "No file found. Please start over.",
      });
      return;
    }

    try {
      setImporting(true);
      const res = await TopicService.importTopics(originalFile, true);

      if (res?.data) {
        notification.success({
          message: t("importSuccess") || "Import Successful",
          description: `${
            res.data.createdCount || previewData.length
          } topics imported successfully`,
        });

        // Flow mới: Result = step 2
        setCurrentStep(2);
      }
    } catch (err) {
      notification.error({
        message: t("importFailed") || "Import Failed",
        description: err?.response?.data?.message || t("pleaseTryAgain"),
      });
    } finally {
      setImporting(false);
    }
  };

  const columns = useMemo(
    () => [
      { title: t("row") || "Row", dataIndex: "row", width: 60 },
      { title: t("title") || "Title", dataIndex: "title" },
      { title: t("semester") || "Semester", dataIndex: "semesterCode" },
      { title: t("majorName") || "Major Name", dataIndex: "majorName" },
      {
        title: t("mentorEmails") || "Mentor Emails",
        dataIndex: "mentorEmails",
      },
      {
        title: t("status") || "Status",
        dataIndex: "statusLabel",
        render: (s) => {
          if (s === "Valid")
            return (
              <Tag icon={<CheckCircleOutlined />} color="success">
                {t("Valid") || "Valid"}
              </Tag>
            );
          if (s === "Warning")
            return (
              <Tag icon={<ExclamationCircleOutlined />} color="warning">
                {t("Warning") || "Warning"}
              </Tag>
            );
          return (
            <Tag icon={<CloseCircleOutlined />} color="error">
              {t("Error") || "Error"}
            </Tag>
          );
        },
      },
      {
        title: t("issues") || "Issues",
        dataIndex: "issues",
        render: (issues) =>
          issues?.length ? (
            <ul className="text-sm text-red-500 list-disc ml-4">
              {issues.map((it, idx) => (
                <li key={idx}>{it}</li>
              ))}
            </ul>
          ) : (
            "-"
          ),
      },
    ],
    [t]
  );

  const errorCount = previewData.filter(
    (p) => p.statusLabel === "Error"
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-1">
          {t("previewValidate") || "Preview & Validate"}
        </h2>
        <p className="text-gray-500">
          {t("reviewDataBeforeImporting") ||
            "Review the data before importing."}
        </p>
      </div>

      <Table
        columns={columns}
        dataSource={previewData}
        pagination={false}
        bordered
        className="rounded-xl overflow-hidden"
      />

      <div className="flex justify-between mt-6">
        <Button
          onClick={() => setCurrentStep(0)}
          className="border-gray-300 hover:border-orange-400"
        >
          {t("Back") || "Back"}
        </Button>

        <Button
          type="default"
          size="large"
          loading={importing}
          className="!bg-[#FF7A00] !text-white !border-none !rounded-md !px-6 !py-2 hover:!opacity-90"
          onClick={handleImport}
          disabled={errorCount > 0 || importing}
        >
          {importing
            ? t("importing") || "Importing..."
            : `${t("importTopic") || "Import"} ${previewData.length} ${
                t("topics") || "Topics"
              }`}
        </Button>
      </div>
    </div>
  );
}
