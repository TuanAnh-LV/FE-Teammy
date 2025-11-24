import React from "react";
import { Upload, Button, notification } from "antd";
import { CloudUploadOutlined, DownloadOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";
import { TopicService } from "../../../services/topic.service";
import { downloadBlob } from "../../../utils/download";

export default function ImportStep1UploadTopic({ setRawData, setCurrentStep }) {
  const handleFile = async (file) => {
    try {
      const res = await TopicService.importTopics(file, true);
      if (res?.data) {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setRawData(res.data);
          setCurrentStep(1);
          notification.success("File imported successfully");
        } else if (res.data && (res.data.totalRows || res.data.createdCount)) {
          const parsed = await parseFile(file);
          setRawData(parsed);
          setCurrentStep(1);
          notification.warning(
            "API returned summary only — using local parse for preview"
          );
        } else {
          const parsed = await parseFile(file);
          setRawData(parsed);
          setCurrentStep(1);
          notification.warning(
            "File parsed locally (API returned unexpected response)"
          );
        }
      }
    } catch (err) {
      console.error(err);
      const parsed = await parseFile(file);
      setRawData(parsed);
      setCurrentStep(1);
      notification.warning("File parsed locally (API error)");
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
        notification.success("Template downloaded");
      }
    } catch (err) {
      console.error(err);
      const template = [
        {
          title: "AI Capstone",
          description: "Build an AI assistant",
          majorName: "Software Engineering",
          createdByName: "Alice Nguyen",
          status: "open",
        },
      ];
      const ws = XLSX.utils.json_to_sheet(template);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Template");
      XLSX.writeFile(wb, "TeammyTopicsTemplate.xlsx");
      notification.warning("Template generated locally (API error)");
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
