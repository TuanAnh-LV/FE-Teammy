import React from "react";
import { useTranslation } from "../../../hook/useTranslation";
import { Upload, Button, notification } from "antd";
import { CloudUploadOutlined, DownloadOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";
import { AdminService } from "../../../services/admin.service";

export default function ImportStep1Upload({ setRawData, setCurrentStep }) {
  const { t } = useTranslation();
  const handleFile = async (file) => {
    try {
      // Call API to import file
      const res = await AdminService.importUsers(file, true);
      if (res?.data) {
        // If API returns full parsed rows (array), use it
        if (Array.isArray(res.data) && res.data.length > 0) {
          setRawData(res.data);
          setCurrentStep(1);
          notification.success({
            message: t("fileImportedSuccess") || "File imported successfully",
          });
        } else if (res.data && (res.data.totalRows || res.data.createdCount)) {
          // API returned only a summary (server processed import). We still want
          // to show the original rows for mapping/preview, so parse the file locally.
          const parsed = await parseFile(file);
          setRawData(parsed);
          setCurrentStep(1);
          notification.warning({
            message:
              t("fileParsedLocally") ||
              "API returned summary only — using local parse for preview",
          });
        } else {
          // Fallback: attempt to parse locally
          const parsed = await parseFile(file);
          setRawData(parsed);
          setCurrentStep(1);
          notification.warning({
            message:
              t("fileParsedLocally") ||
              "File parsed locally (API returned unexpected response)",
          });
        }
      }
    } catch (err) {
      console.error(err);
      // Fallback: parse file locally if API fails
      const parsed = await parseFile(file);
      setRawData(parsed);
      setCurrentStep(1);
      notification.warning({
        message: t("fileParsedLocally") || "File parsed locally (API error)",
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
      // Download template from API
      const res = await AdminService.downloadUsersTemplate(true);
      if (res && res.data) {
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "UserImportTemplate.xlsx");
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);
        notification.success({
          message: t("templateDownloaded") || "Template downloaded",
        });
      }
    } catch (err) {
      console.error(err);
      // Fallback: generate template locally
      const template = [
        {
          Email: "alex@example.com",
          DisplayName: "Alice Nguyen",
          Role: "admin",
          MajorName: "Artificial Intelligence",
          Gender: "female",
          StudentCode: "SE150001",
        },
      ];
      const ws = XLSX.utils.json_to_sheet(template);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Template");
      XLSX.writeFile(wb, "UserImportTemplate.xlsx");
      notification.warning({
        message:
          t("templateGeneratedLocally") ||
          "Template generated locally (API error)",
      });
    }
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
        onClick={handleDownloadTemplate}
      >
        Download Template
      </Button>
    </div>
  );
}
