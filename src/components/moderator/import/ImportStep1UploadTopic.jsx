import React from "react";
import { useTranslation } from "../../../hook/useTranslation";
import { Upload, Button, notification } from "antd";
import { CloudUploadOutlined, DownloadOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";
import { TopicService } from "../../../services/topic.service";
import { downloadBlob } from "../../../utils/download";
import JSZip from "jszip";
export default function ImportStep1UploadTopic({
  setRawData,
  setCurrentStep,
  setOriginalFile,
}) {
  const { t } = useTranslation();
  const handleFile = async (file) => {
    try {
      const parsed = await parseFile(file);
      setRawData(parsed);
      setOriginalFile(file);
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

  // Helper: parse 1 file Excel/CSV thành JSON
  const parseExcelBuffer = (buffer) => {
    const workbook = XLSX.read(buffer, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    return XLSX.utils.sheet_to_json(sheet, { defval: "" });
  };

  const parseFile = (file) =>
    new Promise((resolve, reject) => {
      try {
        const reader = new FileReader();

        reader.onload = async (e) => {
          try {
            const arrayBuffer = e.target.result;

            const isZip =
              file.name?.toLowerCase().endsWith(".zip") ||
              file.type === "application/zip" ||
              file.type === "application/x-zip-compressed";

            if (isZip) {
              // Nếu upload ZIP: mở zip và tìm file Excel/CSV
              const zip = await JSZip.loadAsync(arrayBuffer);

              // ưu tiên file tên Topics.* nếu có
              let excelEntry =
                zip.file(/(?:^|\/)Topics\.(xlsx|xls|csv)$/i)[0] ||
                zip.file(/\.(xlsx|xls|csv)$/i)[0];

              if (!excelEntry) {
                throw new Error(
                  "Không tìm thấy file Excel/CSV trong gói upload. Vui lòng kiểm tra lại."
                );
              }

              const excelBuffer = await excelEntry.async("arraybuffer");
              const json = parseExcelBuffer(excelBuffer);
              resolve(json);
            } else {
              // Trường hợp user upload thẳng file Excel như cũ
              const json = parseExcelBuffer(arrayBuffer);
              resolve(json);
            }
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
        // đổi mặc định từ .xlsx → .zip
        downloadBlob(blob, "TopicRegistrationPackage.zip", disposition);
        notification.success({
          message: t("templateDownloaded") || "Template downloaded",
        });
      }
    } catch {
      // fallback: tự tạo zip local nếu API lỗi
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

      // Tạo file Excel như trước
      const ws = XLSX.utils.json_to_sheet(template);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Template");
      const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });

      // Gói vào ZIP: /docs + Topics.xlsx
      const zip = new JSZip();
      zip.folder("docs"); // có thể thêm tài liệu sau
      zip.file("Topics.xlsx", wbout);

      const zipBlob = await zip.generateAsync({ type: "blob" });

      downloadBlob(zipBlob, "TopicRegistrationPackage.zip");
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
        accept=".xlsx,.xls,.csv,.zip"
        showUploadList={false}
        customRequest={({ file }) => handleFile(file)}
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
