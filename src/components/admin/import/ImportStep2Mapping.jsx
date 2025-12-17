import React, { useState, useEffect, useMemo } from "react";
import { Select, Button, Row, Col, notification } from "antd";
import { CheckCircleFilled } from "@ant-design/icons";
import { AdminService } from "../../../services/admin.service";
import { useTranslation } from "../../../hook/useTranslation";

export default function ImportStep2Mapping({
  rawData,
  setColumnMap,
  setCurrentStep,
  setValidationResult,
}) {
  const { t } = useTranslation();
  const [validating, setValidating] = useState(false);
  const [mapping, setMapping] = useState({});
  const firstRow = useMemo(() => rawData[0] || {}, [rawData]);
  const columns = useMemo(() => Object.keys(firstRow), [firstRow]);

  useEffect(() => {
    const auto = {};
    columns.forEach((col) => {
      const c = col.toLowerCase();
      if (c.includes("email")) auto.email = col;
      if (c.includes("displayname")) auto.displayName = col;
      if (c.includes("role")) auto.role = col;
      if (c.includes("major")) auto.majorName = col;
      if (c.includes("gender")) auto.gender = col;
      if (c.includes("student") || c.includes("code")) auto.studentCode = col;
    });
    setMapping(auto);
  }, [columns]);

  const handleContinue = async () => {
    try {
      setValidating(true);
      setColumnMap(mapping);

      const mappedData = rawData.map((row) => ({
        email: row[mapping.email] || "",
        displayName: row[mapping.displayName] || "",
        role: row[mapping.role] || "student",
        majorName: row[mapping.majorName] || "",
        gender: row[mapping.gender] || "",
        studentCode: row[mapping.studentCode] || "",
      }));

      const res = await AdminService.validateImportUsers(mappedData, true);

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
          {t("columnMapping") || "Column Mapping"}
        </h2>
        <p className="text-gray-500">
          {t("columnsAutoMapped") ||
            "Columns have been automatically mapped. Adjust if needed."}
        </p>
      </div>

      <Row gutter={[16, 12]} justify="center">
        {[
          "email",
          "displayName",
          "role",
          "majorName",
          "gender",
          "studentCode",
        ].map((field) => (
          <Col span={12} key={field}>
            <div className="flex items-center justify-between bg-gray-50 border rounded-lg px-4 py-3 hover:border-blue-400 transition-all">
              <span className="font-medium text-gray-700 capitalize">
                {field === "displayName"
                  ? "Display Name"
                  : field === "majorName"
                  ? "Major Name"
                  : field === "studentCode"
                  ? "Student Code"
                  : field}
              </span>
              <Select
                value={mapping[field]}
                onChange={(val) => setMapping((p) => ({ ...p, [field]: val }))}
                placeholder="Select column"
                style={{ width: 200 }}
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
          disabled={validating || !mapping.email || !mapping.displayName}
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
