import React from "react";
import { useTranslation } from "../../../hook/useTranslation";
import { Upload, Button, notification } from "antd";
import { CloudUploadOutlined, DownloadOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";
import { AdminService } from "../../../services/admin.service";

export default function ImportStep1Upload({
  setRawData,
  setCurrentStep,
  setOriginalFile,
  setValidationResult,
  setUploadedUsers,
}) {
  const { t } = useTranslation();

  const mapRawDataToUsers = (rawData) =>
    rawData.map((row) => ({
      email: row.Email || "",
      displayName: row.DisplayName || "",
      role: row.Role || "student",
      majorName: row.MajorName || "",
      gender: row.Gender || "",
      studentCode: row.StudentCode || "",
      gpa: row.GPA || "",
    }));

  const handleFile = async (file) => {
    try {
      const parsed = await parseFile(file);
      setRawData(parsed);
      setOriginalFile(file);

      const mappedUsers = mapRawDataToUsers(parsed);

      setUploadedUsers(mappedUsers);

      const res = await AdminService.validateImportUsers(mappedUsers, true);
      setValidationResult(res.data);

      notification.success({
        message: t("fileValidated") || "File validated successfully",
        description: `${res.data.summary?.validRows || 0}/${
          res.data.summary?.totalRows || 0
        } valid rows`,
      });

      setCurrentStep(1);
    } catch (err) {
      notification.error({
        message: t("fileUploadFailed") || "Failed to upload file",
        description:
          err?.response?.data?.message || err.message || "Please try again",
      });
      throw err;
    }
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
    } catch {
      const template = [
        {
          Email: "alex@example.com",
          DisplayName: "Alice Nguyen",
          Role: "admin",
          MajorName: "Artificial Intelligence",
          Gender: "female",
          StudentCode: "SE150001",
          GPA: "3.2",
        },
      ];
      const ws = XLSX.utils.json_to_sheet(template);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Template");
      XLSX.writeFile(wb, "UserImportTemplate.xlsx");
      notification.info({
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
        customRequest={async ({ file, onSuccess, onError }) => {
          try {
            await handleFile(file);
            onSuccess?.("ok");
          } catch (e) {
            onError?.(e);
          }
        }}
        className="w-full max-w-3xl border-2 border-dashed border-gray-300 bg-white rounded-xl py-14 hover:border-orange-400 transition-all"
      >
        <CloudUploadOutlined className="text-5xl text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-700 mb-2">
          {t("uploadYourFile") || "Upload your file"}
        </h3>
        <p className="text-gray-400 text-sm mb-6">
          {t("dragDropOrClick") ||
            "Drag and drop your CSV or Excel file here, or click to browse"}
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
          {t("chooseFile") || "Choose File"}
        </Button>
      </Upload.Dragger>

      <Button
        icon={<DownloadOutlined />}
        className="!mt-8 !px-5 !py-2 !border-gray-300 hover:!border-orange-400 hover:!text-orange-500"
        onClick={handleDownloadTemplate}
      >
        {t("downloadTemplate") || "Download Template"}
      </Button>
    </div>
  );
}

