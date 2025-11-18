import React, { useState, useEffect, useMemo } from "react";
import { Select, Button, Row, Col } from "antd";
import { CheckCircleFilled } from "@ant-design/icons";

export default function ImportStep2MappingTopic({
  rawData,
  setColumnMap,
  setCurrentStep,
}) {
  const [mapping, setMapping] = useState({});
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
      if (
        c.includes("createdby") ||
        c.includes("creator") ||
        c.includes("created_by")
      )
        auto.createdByName = col;
      if (c.includes("status")) auto.status = col;
      if (c.includes("mentor") || c.includes("mentors")) auto.mentorName = col;
    });
    setMapping(auto);
  }, [columns]);

  const handleContinue = () => {
    setColumnMap(mapping);
    setCurrentStep(2);
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
          "createdByName",
          "status",
          "mentorName",
        ].map((field) => (
          <Col span={12} key={field}>
            <div className="flex items-center justify-between bg-gray-50 border rounded-lg px-4 py-3 hover:border-blue-400 transition-all">
              <span className="font-medium text-gray-700 capitalize">
                {field}
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

      <div className="flex justify-end mt-8">
        <Button
          type="primary"
          size="large"
          className="!bg-[#FF7A00] !text-white !border-none !rounded-md !px-6 !py-2 hover:!opacity-90"
          onClick={handleContinue}
        >
          Continue to Preview
        </Button>
      </div>
    </div>
  );
}
