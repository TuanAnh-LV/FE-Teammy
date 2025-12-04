import React, { useEffect, useState, useMemo } from "react";
import { Table, Button, Checkbox, Select, Tag, notification } from "antd";
import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { AdminService } from "../../../services/admin.service";
import { useTranslation } from "../../../hook/useTranslation";

const { Option } = Select;

export default function ImportStep3Preview({
  rawData,
  columnMap,
  setMappedUsers,
  setCurrentStep,
  validationResult,
  originalFile,
}) {
  const { t } = useTranslation();
  const [previewData, setPreviewData] = useState([]);
  const [sendEmail, setSendEmail] = useState(true);
  const [importMode, setImportMode] = useState("create");
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

      const email = rowData.Email || "";
      const displayName = rowData.DisplayName || "";
      const role = rowData.Role || "student";
      const majorName = rowData.MajorName || "-";
      const gender = rowData.Gender || "-";
      const studentCode = rowData.StudentCode || "-";

      // Xác định status từ validation result
      let status = row.isValid ? "Valid" : "Error";
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
        status = "Warning";
      }

      return {
        key: i,
        row: row.rowNumber,
        email,
        displayName,
        role: String(role).charAt(0).toUpperCase() + String(role).slice(1),
        majorName,
        gender,
        studentCode,
        status,
        issues,
      };
    });
    setPreviewData(mapped);
    if (setMappedUsers) setMappedUsers(mapped);
  }, [validationResult, rawData, columnMap, setMappedUsers]);

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

  // Stats
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-1">
          Preview & Validate
        </h2>
        <p className="text-gray-500">
          Review the data before importing.{" "}
          <span className="text-blue-500 cursor-pointer hover:underline">
            Review the data before importing
          </span>
        </p>
      </div>

      {/* Options */}
      <div className="flex items-start justify-between bg-gray-50 p-5 rounded-lg border border-gray-200">
        <div className="flex flex-col gap-2">
          <label className="font-medium text-gray-700">Import Mode</label>
          <Select
            value={importMode}
            onChange={setImportMode}
            style={{ width: 220 }}
          >
            <Option value="create">Create Only</Option>
            <Option value="update">Update Existing</Option>
            <Option value="both">Create or Update</Option>
          </Select>
          <span className="text-xs text-gray-400">
            Only creates new users, skips existing emails
          </span>
        </div>

        <div className="flex flex-col items-end">
          <Checkbox
            checked={sendEmail}
            onChange={(e) => setSendEmail(e.target.checked)}
          >
            Send Welcome Emails
          </Checkbox>
          <span className="text-xs text-gray-400">
            Send email notifications to new users
          </span>
        </div>
      </div>

      {/* Status Summary */}
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

      {/* Table */}
      <Table
        columns={columns}
        dataSource={previewData}
        pagination={false}
        bordered
        className="rounded-xl overflow-hidden"
      />

      {/* Actions */}
      <div className="flex justify-between mt-6">
        <Button
          onClick={() => setCurrentStep(1)}
          className="border-gray-300 hover:border-orange-400"
        >
          Back to Mapping
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

