import React, { useEffect, useState, useMemo } from "react";
import { Table, Button, Select, Tag } from "antd";
import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";

const { Option } = Select;

export default function ImportStep3PreviewTopic({
  rawData,
  columnMap,
  setMappedTopics,
  setCurrentStep,
}) {
  const [previewData, setPreviewData] = useState([]);

  useEffect(() => {
    const get = (row, key) => {
      if (!row || key == null) return "";
      if (typeof key === "number" || /^\d+$/.test(String(key))) {
        const idx = Number(key);
        return Array.isArray(row) ? row[idx] ?? "" : row[idx] ?? row[key] ?? "";
      }
      return row[key] ?? row[String(key).trim()] ?? "";
    };

    const mapped = (rawData || []).map((r, i) => {
      const title = get(r, columnMap.title) || "";
      const description = get(r, columnMap.description) || "";
      const majorName = get(r, columnMap.majorName) || "";
      const createdByName = get(r, columnMap.createdByName) || "";
      const status = (get(r, columnMap.status) || "").toString();

      let s = "Valid";
      const issues = [];
      if (!title || String(title).trim().length === 0) {
        s = "Error";
        issues.push("Title is required");
      }
      if (!createdByName) {
        s = s === "Error" ? "Error" : "Warning";
        issues.push("Creator name not provided");
      }

      return {
        key: i,
        row: i + 1,
        title,
        description,
        majorName: majorName || "-",
        createdByName: createdByName || "-",
        status: status || "open",
        statusLabel: s,
        issues,
      };
    });
    setPreviewData(mapped);
    if (setMappedTopics) setMappedTopics(mapped);
  }, [rawData, columnMap, setMappedTopics]);

  const columns = useMemo(
    () => [
      { title: "Row", dataIndex: "row", width: 60 },
      { title: "Title", dataIndex: "title" },
      { title: "Creator", dataIndex: "createdByName" },
      { title: "Major", dataIndex: "majorName" },
      {
        title: "Status",
        dataIndex: "statusLabel",
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

  const errorCount = previewData.filter(
    (p) => p.statusLabel === "Error"
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-1">
          Preview & Validate
        </h2>
        <p className="text-gray-500">Review the data before importing.</p>
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
          Back to Mapping
        </Button>

        <Button
          type="default"
          size="large"
          className="!bg-[#FF7A00] !text-white !border-none !rounded-md !px-6 !py-2 hover:!opacity-90"
          onClick={() => setCurrentStep(3)}
          disabled={errorCount > 0}
        >
          Import {previewData.length} Topics
        </Button>
      </div>
    </div>
  );
}
