import React, { useEffect, useState } from "react";
import { Table, Button, Checkbox, Select, Tag } from "antd";
import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";

const { Option } = Select;

export default function ImportStep3Preview({
  rawData,
  columnMap,
  setMappedUsers,
  setCurrentStep,
}) {
  const [previewData, setPreviewData] = useState([]);
  const [sendEmail, setSendEmail] = useState(true);
  const [importMode, setImportMode] = useState("create");

  useEffect(() => {
    const mapped = rawData.map((r, i) => {
      const email = r[columnMap.email];
      const name = r[columnMap.name];
      const validEmail = email && email.includes("@");
      const validName = name && name.trim().length > 0;

      let status = "Valid";
      let issues = [];

      if (!validEmail) {
        status = "Error";
        issues.push("Invalid email format");
      }
      if (!validName) {
        status = "Error";
        issues.push("Full name is required");
      }

      // Fake warning example
      if (status === "Valid" && !r.github) {
        status = "Warning";
        issues.push("No GitHub URL provided");
      }

      return {
        key: i,
        row: i + 1,
        email,
        name,
        role: r[columnMap.role] || "Student",
        status,
        issues,
      };
    });
    setPreviewData(mapped);
    setMappedUsers(mapped);
  }, [rawData, columnMap]);

  // Stats
  const validCount = previewData.filter((u) => u.status === "Valid").length;
  const warnCount = previewData.filter((u) => u.status === "Warning").length;
  const errorCount = previewData.filter((u) => u.status === "Error").length;

  const columns = [
    { title: "Row", dataIndex: "row", width: 60 },
    { title: "Email", dataIndex: "email" },
    { title: "Name", dataIndex: "name" },
    { title: "Role", dataIndex: "role" },
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
  ];

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
          className="!bg-[#FF7A00] !text-white !border-none !rounded-md !px-6 !py-2 hover:!opacity-90"
          onClick={() => setCurrentStep(3)}
          disabled={errorCount > 0}
        >
          Import {previewData.length} Users
        </Button>
      </div>
    </div>
  );
}
