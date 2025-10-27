import React, { useState, useEffect } from "react";
import { Select, Button, Row, Col } from "antd";
import { CheckCircleFilled } from "@ant-design/icons";

export default function ImportStep2Mapping({
  rawData,
  setColumnMap,
  setCurrentStep,
}) {
  const [mapping, setMapping] = useState({});
  const firstRow = rawData[0] || {};
  const columns = Object.keys(firstRow);

  useEffect(() => {
    const auto = {};
    columns.forEach((col) => {
      const c = col.toLowerCase();
      if (c.includes("email")) auto.email = col;
      if (c.includes("name")) auto.name = col;
      if (c.includes("role")) auto.role = col;
      if (c.includes("major")) auto.major = col;
      if (c.includes("status")) auto.status = col;
    });
    setMapping(auto);
  }, [rawData]);

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
        {["email", "name", "role", "major", "status"].map((field) => (
          <Col span={12} key={field}>
            <div className="flex items-center justify-between bg-gray-50 border rounded-lg px-4 py-3 hover:border-blue-400 transition-all">
              <span className="font-medium text-gray-700 capitalize">
                {field}
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
