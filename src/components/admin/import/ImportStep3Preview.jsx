import React, { useEffect, useState, useMemo } from "react";
import { Table, Button, Tag, notification } from "antd";
import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { AdminService } from "../../../services/admin.service";
import { useTranslation } from "../../../hook/useTranslation";

export default function ImportStep3Preview({
  uploadedUsers, // ✅ data thật từ payload validate
  setMappedUsers,
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
      const u = uploadedUsers?.[idx] || {};

      const roleRaw = u.role || "student";
      const role =
        String(roleRaw).charAt(0).toUpperCase() + String(roleRaw).slice(1);

      let status = row.isValid ? "Valid" : "Error";
      const issues = [];

      row.columns?.forEach((col) => {
        if (!col.isValid && col.errorMessage) {
          issues.push(`${col.column}: ${col.errorMessage}`);
        }
      });

      if (Array.isArray(row.messages) && row.messages.length) {
        issues.push(...row.messages);
      }

      if (issues.length > 0 && row.isValid) status = "Warning";

      return {
        key: i,
        row: row.rowNumber ?? i + 1,
        email: u.email || "",
        displayName: u.displayName || "",
        role,
        majorName: u.majorName || "-",
        gender: u.gender || "-",
        studentCode: u.studentCode || "-",
        status,
        issues,
      };
    });

    setPreviewData(mapped);
    setMappedUsers(mapped);
  }, [validationResult, uploadedUsers, setMappedUsers]);

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
      const res = await AdminService.importUsers(originalFile, true);

      if (res?.data) {
        notification.success({
          message: t("importSuccess") || "Import Successful",
          description: `${
            res.data.createdCount || previewData.length
          } users imported successfully`,
        });

        setCurrentStep(2); // ✅ Result step
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

  const validCount = previewData.filter((u) => u.status === "Valid").length;
  const warnCount = previewData.filter((u) => u.status === "Warning").length;
  const errorCount = previewData.filter((u) => u.status === "Error").length;

  const columns = useMemo(
    () => [
      { title: "Row", dataIndex: "row", width: 60 },
      { title: "Email", dataIndex: "email" },
      { title: "Display Name", dataIndex: "displayName" },
      { title: "Role", dataIndex: "role" },
      { title: "Major", dataIndex: "majorName" },
      { title: "Gender", dataIndex: "gender" },
      { title: "Student Code", dataIndex: "studentCode" },
      {
        title: "Status",
        dataIndex: "status",
        render: (status) => {
          if (status === "Valid")
            return (
              <Tag icon={<CheckCircleOutlined />} color="success">
                Valid
              </Tag>
            );
          if (status === "Warning")
            return (
              <Tag icon={<ExclamationCircleOutlined />} color="warning">
                Warning
              </Tag>
            );
          return (
            <Tag icon={<CloseCircleOutlined />} color="error">
              Error
            </Tag>
          );
        },
      },
      {
        title: "Issues",
        dataIndex: "issues",
        render: (issues) =>
          issues?.length ? (
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-1">
          Preview & Validate
        </h2>
        <p className="text-gray-500">Review the data before importing.</p>
      </div>

      <div className="flex justify-end items-center gap-6 text-sm font-medium text-gray-600">
        <span className="flex items-center gap-1 text-green-600">
          <span className="w-2 h-2 rounded-full bg-green-500" /> {validCount}{" "}
          Valid
        </span>
        <span className="flex items-center gap-1 text-yellow-600">
          <span className="w-2 h-2 rounded-full bg-yellow-400" /> {warnCount}{" "}
          Warnings
        </span>
        <span className="flex items-center gap-1 text-red-600">
          <span className="w-2 h-2 rounded-full bg-red-500" /> {errorCount}{" "}
          Errors
        </span>
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
            : `${t("import") || "Import"} ${previewData.length} ${
                t("users") || "Users"
              }`}
        </Button>
      </div>
    </div>
  );
}
