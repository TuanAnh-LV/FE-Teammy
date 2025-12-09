import React, { useEffect, useState, useMemo } from "react";
import { Table, Button, Select, Tag, notification } from "antd";
import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { TopicService } from "../../../services/topic.service";
import { useTranslation } from "../../../hook/useTranslation";

const { Option } = Select;

export default function ImportStep3PreviewTopic({
  rawData,
  columnMap,
  setMappedTopics,
  setCurrentStep,
  validationResult,
  originalFile,
}) {
  const { t } = useTranslation();
  const [previewData, setPreviewData] = useState([]);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    if (!validationResult || !validationResult.rows) {
      return;
    }

    const mapped = validationResult.rows.map((row, i) => {
      // Lấy data từ validation result
      const rowData = {};
      row.columns.forEach((col) => {
        const fieldName =
          col.column.charAt(0).toLowerCase() + col.column.slice(1);
        rowData[col.column] = rawData[i]?.[columnMap[fieldName]] || "";
      });

      const title = rowData.Title || "";
      const description = rowData.Description || "";
      const majorName = rowData.MajorName || "-";
      const semesterCode = rowData.SemesterCode || "-";
      const source = rowData.Source || "-";
      const mentorEmails = rowData.MentorEmails || "-";
      const status = rowData.Status || "open";

      // Xác định status từ validation result
      let statusLabel = row.isValid ? "Valid" : "Error";
      const issues = [];

      // Lấy error messages từ columns
      row.columns.forEach((col) => {
        if (!col.isValid && col.errorMessage) {
          issues.push(`${col.column}: ${col.errorMessage}`);
        }
      });

      // Lấy general messages
      if (row.messages && row.messages.length > 0) {
        issues.push(...row.messages);
      }

      // Nếu có issues nhưng isValid = true, đó là warning
      if (issues.length > 0 && row.isValid) {
        statusLabel = "Warning";
      }

      return {
        key: i,
        row: row.rowNumber,
        title,
        description,
        majorName,
        semesterCode,
        source,
        mentorEmails,
        status,
        statusLabel,
        issues,
      };
    });
    setPreviewData(mapped);
    if (setMappedTopics) setMappedTopics(mapped);
  }, [validationResult, rawData, columnMap, setMappedTopics]);

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
        setCurrentStep(3);
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
      { title: t("source") || "Source", dataIndex: "source" },
      {
        title: t("mentorEmails") || "Mentor Emails",
        dataIndex: "mentorEmails",
      },
      {
        title: t("status") || "Status",
        dataIndex: "statusLabel",
        render: (status) => {
          if (status === "Valid")
            return (
              <Tag icon={<CheckCircleOutlined />} color="success">
                {t("Valid") || "Valid"}
              </Tag>
            );
          if (status === "Warning")
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
          issues.length ? (
            <ul className="text-sm text-red-500 list-disc ml-4">
              {issues.map((i, idx) => (
                <li key={idx}>{i}</li>
              ))}
            </ul>
          ) : (
            "-"
          ),
      },
    ],
    []
  );

  const errorCount = previewData.filter(
    (p) => p.statusLabel === "Error"
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-1">
          {t("previewValidate")}
        </h2>
        <p className="text-gray-500">{t("reviewDataBeforeImporting")}</p>
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
          onClick={() => setCurrentStep(1)}
          className="border-gray-300 hover:border-orange-400"
        >
          {t("backToMapping") || "Back to Mapping"}
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
