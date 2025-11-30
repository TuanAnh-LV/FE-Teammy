import React, { useState, useEffect, useMemo } from "react";
import { Select, Button, Row, Col, notification } from "antd";
import { CheckCircleFilled } from "@ant-design/icons";
import { TopicService } from "../../../services/topic.service";
import { useTranslation } from "../../../hook/useTranslation";

export default function ImportStep2MappingTopic({
  rawData,
  setColumnMap,
  setCurrentStep,
  setValidationResult,
}) {
  const { t } = useTranslation();
  const [mapping, setMapping] = useState({});
  const [validating, setValidating] = useState(false);
  const firstRow = useMemo(() => rawData[0] || {}, [rawData]);
  const columns = useMemo(() => Object.keys(firstRow), [firstRow]);

  useEffect(() => {
    const auto = {};
    columns.forEach((col) => {
      const c = col.toLowerCase();
      if (c.includes("title") || c.includes("topic")) auto.title = col;
      if (c.includes("description") || c.includes("desc"))
        auto.description = col;
      if (c.includes("major")) auto.majorName = col;
      if (c.includes("semester")) auto.semesterCode = col;
      if (c.includes("status")) auto.status = col;
      if (c.includes("source")) auto.source = col;
      if (c.includes("mentor") && c.includes("email")) auto.mentorEmails = col;
    });
    setMapping(auto);
  }, [columns]);

  const handleContinue = async () => {
    try {
      setValidating(true);
      setColumnMap(mapping);

      // Map raw data theo column mapping
      const mappedData = rawData.map((row) => ({
        title: row[mapping.title] || "",
        description: row[mapping.description] || "",
        majorName: row[mapping.majorName] || "",
        semesterCode: row[mapping.semesterCode] || "",
        status: row[mapping.status] || "open",
        source: row[mapping.source] || "",
        mentorEmails: row[mapping.mentorEmails]
          ? [row[mapping.mentorEmails]]
          : [],
      }));

      // Gọi API validate
      const res = await TopicService.validateImportTopics(mappedData, true);

      if (res?.data) {
        setValidationResult(res.data);
        setCurrentStep(2);
        notification.success({
          message: t("validationComplete") || "Validation Complete",
          description: `${res.data.summary?.validRows || 0}/${
            res.data.summary?.totalRows || 0
          } valid rows`,
        });
      }
    } catch (err) {
      console.error(err);
      notification.error({
        message: t("validationFailed") || "Validation Failed",
        description: err?.response?.data?.message || t("pleaseTryAgain"),
      });
    } finally {
      setValidating(false);
    }
  };

  return (
    <div className="space-y-8 text-center">
      <div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Column Mapping
        </h2>
        <p className="text-gray-500">
          Columns have been automatically mapped. Adjust if needed.
        </p>
      </div>

      <Row gutter={[16, 12]} justify="center">
        {[
          "title",
          "description",
          "majorName",
          "semesterCode",
          "status",
          "source",
          "mentorEmails",
        ].map((field) => (
          <Col span={12} key={field}>
            <div className="flex items-center justify-between bg-gray-50 border rounded-lg px-4 py-3 hover:border-blue-400 transition-all">
              <span className="font-medium text-gray-700 capitalize">
                {field === "majorName"
                  ? "Major Name"
                  : field === "semesterCode"
                  ? "Semester Code"
                  : field === "mentorEmails"
                  ? "Mentor Emails"
                  : field === "source"
                  ? "Source"
                  : field}
              </span>
              <Select
                value={mapping[field]}
                onChange={(val) => setMapping((p) => ({ ...p, [field]: val }))}
                placeholder="Select column"
                style={{ width: 220 }}
              >
                {columns.map((col) => (
                  <Select.Option key={col} value={col}>
                    {col}
                    {firstRow[col] ? (
                      <span className="ml-2 text-xs text-gray-500">
                        {" "}
                        — {String(firstRow[col])}
                      </span>
                    ) : null}
                  </Select.Option>
                ))}
              </Select>
              {mapping[field] && (
                <CheckCircleFilled className="text-green-500 ml-2 text-lg" />
              )}
            </div>
          </Col>
        ))}
      </Row>

      <div className="flex justify-between mt-8">
        <Button
          onClick={() => setCurrentStep(0)}
          className="border-gray-300 hover:border-orange-400"
          size="large"
        >
          {t("back") || "Back"}
        </Button>
        <Button
          type="primary"
          size="large"
          loading={validating}
          disabled={validating || !mapping.title}
          className="!bg-[#FF7A00] !text-white !border-none !rounded-md !px-6 !py-2 hover:!opacity-90"
          onClick={handleContinue}
        >
          {validating
            ? t("validating") || "Validating..."
            : t("continueToPreview") || "Continue to Preview"}
        </Button>
      </div>
    </div>
  );
}
