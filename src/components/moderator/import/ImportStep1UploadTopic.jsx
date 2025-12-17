import React, { useState } from "react";
import { useTranslation } from "../../../hook/useTranslation";
import { Upload, Button, notification } from "antd";
import { CloudUploadOutlined, DownloadOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";
import { TopicService } from "../../../services/topic.service";
import { downloadBlob } from "../../../utils/download";
import JSZip from "jszip";

export default function ImportStep1UploadTopic({
  setRawData,
  setUploadedTopics,
  setValidationResult,
  setCurrentStep,
  setOriginalFile,
}) {
  const { t } = useTranslation();
  const [validating, setValidating] = useState(false);

  const normalizeHeader = (h) =>
    String(h || "")
      .trim()
      .replace(/\s+/g, "")
      .toLowerCase();

  const guessColumnKeys = (firstRow) => {
    const keys = Object.keys(firstRow || {});
    const pick = (pred) => keys.find((k) => pred(normalizeHeader(k))) || null;

    return {
      title: pick((h) => h.includes("title") || h.includes("topic")),
      description: pick((h) => h.includes("description") || h.includes("desc")),
      majorName: pick((h) => h.includes("major")),
      semesterCode: pick((h) => h.includes("semester")),
      status: pick((h) => h.includes("status")),
      mentorEmails: pick((h) => h.includes("mentor") && h.includes("email")),
    };
  };

  const toMentorEmailsArray = (value) => {
    if (!value) return [];
    if (Array.isArray(value))
      return value.map((x) => String(x).trim()).filter(Boolean);

    const s = String(value).trim();
    if (!s) return [];
    // tách theo , ; | xuống dòng
    return s
      .split(/[,;|\n]+/g)
      .map((x) => x.trim())
      .filter(Boolean);
  };

  const parseExcelBuffer = (buffer) => {
    const workbook = XLSX.read(buffer, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    // lọc dòng rỗng
    return (json || []).filter((row) =>
      Object.values(row).some((v) => String(v).trim() !== "")
    );
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
              const zip = await JSZip.loadAsync(arrayBuffer);
              const excelEntry =
                zip.file(/(?:^|\/)Topics\.(xlsx|xls|csv)$/i)[0] ||
                zip.file(/\.(xlsx|xls|csv)$/i)[0];

              if (!excelEntry) {
                throw new Error(
                  "Không tìm thấy file Excel/CSV trong gói upload. Vui lòng kiểm tra lại."
                );
              }

              const excelBuffer = await excelEntry.async("arraybuffer");
              resolve(parseExcelBuffer(excelBuffer));
              return;
            }

            // upload file excel trực tiếp
            resolve(parseExcelBuffer(arrayBuffer));
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

  const handleFile = async (file) => {
    setValidating(true);
    try {
      const parsed = await parseFile(file);
      if (!parsed?.length) {
        notification.error({
          message: t("fileEmpty") || "Empty file",
          description:
            t("noRowsFound") || "No rows found in the uploaded file.",
        });
        throw new Error("EMPTY_FILE");
      }

      setRawData(parsed);
      setOriginalFile(file);

      const col = guessColumnKeys(parsed[0]);
      if (!col.title) {
        notification.error({
          message: t("invalidTemplate") || "Invalid template",
          description:
            t("missingTitleColumn") ||
            "Missing Title column. Please use the provided template.",
        });
        throw new Error("MISSING_TITLE");
      }

      const mappedTopics = parsed.map((row) => ({
        title: String(row[col.title] ?? "").trim(),
        description: col.description
          ? String(row[col.description] ?? "").trim()
          : "",
        majorName: col.majorName ? String(row[col.majorName] ?? "").trim() : "",
        semesterCode: col.semesterCode
          ? String(row[col.semesterCode] ?? "").trim()
          : "",
        status: col.status
          ? String(row[col.status] ?? "open").trim() || "open"
          : "open",
        mentorEmails: toMentorEmailsArray(
          col.mentorEmails ? row[col.mentorEmails] : ""
        ),
      }));

      // ✅ lưu payload để Preview hiển thị (vì validate thường không trả data)
      setUploadedTopics(mappedTopics);

      // ✅ validate ngay tại step 1 (bỏ step mapping)
      const res = await TopicService.validateImportTopics(mappedTopics, true);
      setValidationResult(res.data);

      const valid = res.data?.summary?.validRows || 0;
      const total = res.data?.summary?.totalRows || 0;

      notification.success({
        message: t("validationComplete") || "Validation Complete",
        description: `${valid}/${total} valid rows`,
      });

      // Flow mới: nhảy thẳng Review
      setCurrentStep(1);
    } catch (err) {
      if (err?.message !== "EMPTY_FILE" && err?.message !== "MISSING_TITLE") {
        notification.error({
          message: t("fileUploadFailed") || "Failed to upload file",
          description:
            err?.message || t("pleaseTryAgain") || "Please try again",
        });
      }
      throw err; // ✅ để customRequest không gọi onSuccess
    } finally {
      setValidating(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const res = await TopicService.exportTopics(true);
      if (res && res.data) {
        const blob = res.data;
        const disposition = res?.headers?.["content-disposition"];
        downloadBlob(blob, "TopicRegistrationPackage.zip", disposition);
        notification.success({
          message: t("templateDownloaded") || "Template downloaded",
        });
      }
    } catch {
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
      const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });

      const zip = new JSZip();
      zip.folder("docs");
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
        disabled={validating}
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
          {validating
            ? t("validating") || "Validating..."
            : t("dragDropOrClick") ||
              "Drag and drop your CSV/Excel/ZIP here, or click to browse"}
        </p>

        <Button
          type="default"
          size="large"
          loading={validating}
          disabled={validating}
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
        disabled={validating}
      >
        {t("downloadTemplate") || "Download Template"}
      </Button>
    </div>
  );
}
