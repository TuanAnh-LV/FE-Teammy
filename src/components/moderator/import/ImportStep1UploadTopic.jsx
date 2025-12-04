import React from "react";
import { useTranslation } from "../../../hook/useTranslation";
import { Upload, Button, notification } from "antd";
import { CloudUploadOutlined, DownloadOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";
import { TopicService } from "../../../services/topic.service";
import { downloadBlob } from "../../../utils/download";

export default function ImportStep1UploadTopic({
  setRawData,
  setCurrentStep,
  setOriginalFile,
}) {
  const { t } = useTranslation();
  const handleFile = async (file) => {
    try {
      // Parse file locally (không gọi API import)
      const parsed = await parseFile(file);
      setRawData(parsed);
      setOriginalFile(file); // Lưu file gốc để dùng cho import API
      setCurrentStep(1);
      notification.success({
        message: t("fileUploadedSuccess") || "File uploaded successfully",
        description: `${parsed.length} rows found`,
      });
    } catch (err) {

      notification.error({
        message: t("fileUploadFailed") || "Failed to upload file",
        description: err.message || "Please try again",
      });
    }
    return false;
  };

  const parseFile = (file) =>
    new Promise((resolve, reject) => {
      try {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const workbook = XLSX.read(e.target.result, { type: "array" });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const json = XLSX.utils.sheet_to_json(sheet, { defval: "" });
            resolve(json);
          } catch (ex) {
            reject(ex);
          }
        };
        reader.onerror = (ev) => reject(ev);
        reader.readAsArrayBuffer(file);
      } catch (ex) {
        reject(ex);
      }
    });

  const handleDownloadTemplate = async () => {
    try {
      const res = await TopicService.exportTopics(true);
      if (res && res.data) {
        const blob = res.data;
        const disposition = res?.headers?.["content-disposition"];
        downloadBlob(blob, "TeammyTopicsTemplate.xlsx", disposition);
        notification.success({
          message: t("templateDownloaded") || "Template downloaded",
        });
      }
    } catch (err) {

      const template = [
        {
          title: "AI Tutor",
          description: "LLM-powered tutor",
          semesterCode: "2025A",
          majorCode: "SE",
          status: "open",
          mentorEmails: "mentor1@example.com",
        },
      ];
      const ws = XLSX.utils.json_to_sheet(template);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Template");
      XLSX.writeFile(wb, "TeammyTopicsTemplate.xlsx");
      notification.warning({
        message:
          t("templateGeneratedLocally") ||
          "Template generated locally (API error)",
      });
    }
  };

  return (
    <div className="flex flex-col items-center w-full text-center mt-6">
      <Upload.Dragger
        multiple={false}
        accept=".xlsx,.xls,.csv"
        showUploadList={false}
        customRequest={({ file }) => handleFile(file)}
        className="w-full max-w-3xl border-2 border-dashed border-gray-300 bg-white rounded-xl py-14 hover:border-orange-400 transition-all"
      >
        <CloudUploadOutlined className="text-5xl text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-700 mb-2">
          Upload your file
        </h3>
        <p className="text-gray-400 text-sm mb-6">
          Drag and drop your CSV or Excel file here, or click to browse
        </p>

        <Button
          type="default"
          size="large"
          style={{
            backgroundColor: "#FF7A00",
            color: "white",
            border: "none",
            borderRadius: "6px",
            padding: "0 24px",
          }}
          className="hover:opacity-90"
        >
          Choose File
        </Button>
      </Upload.Dragger>

      <Button
        icon={<DownloadOutlined />}
        className="!mt-8 !px-5 !py-2 !border-gray-300 hover:!border-orange-400 hover:!text-orange-500"
        onClick={handleDownloadTemplate}
      >
        Download Template
      </Button>
    </div>
  );
}

