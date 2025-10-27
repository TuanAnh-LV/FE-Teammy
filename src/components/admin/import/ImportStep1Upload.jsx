import React from "react";
import { Upload, Button } from "antd";
import { CloudUploadOutlined, DownloadOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";

export default function ImportStep1Upload({ setRawData, setCurrentStep }) {
  const handleFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const workbook = XLSX.read(e.target.result, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet, { defval: "" });
      setRawData(json);
      setCurrentStep(1);
    };
    reader.readAsArrayBuffer(file);
    return false;
  };

  return (
    <div className="flex flex-col items-center w-full text-center mt-6">
      {/* Upload Box */}
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

      {/* Download Template */}
      <Button
        icon={<DownloadOutlined />}
        className="!mt-8 !px-5 !py-2 !border-gray-300 hover:!border-orange-400 hover:!text-orange-500"
        onClick={() => {
          const template = [
            {
              Name: "Nguyen Van A",
              Email: "a@example.com",
              Role: "Student",
              Status: "Active",
              Major: "Software Engineering",
            },
          ];
          const ws = XLSX.utils.json_to_sheet(template);
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, "Template");
          XLSX.writeFile(wb, "UserImportTemplate.xlsx");
        }}
      >
        Download Template
      </Button>
    </div>
  );
}
