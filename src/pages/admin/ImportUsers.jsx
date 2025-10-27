import React, { useState } from "react";
import { Steps, Button } from "antd";
import {
  UploadOutlined,
  SwapOutlined,
  EyeOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";

import ImportStep1Upload from "../../components/admin/import/ImportStep1Upload";
import ImportStep2Mapping from "../../components/admin/import/ImportStep2Mapping";
import ImportStep3Preview from "../../components/admin/import/ImportStep3Preview";
import ImportStep4Result from "../../components/admin/import/ImportStep4Result";
import { useNavigate } from "react-router-dom";
const ImportUsers = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [rawData, setRawData] = useState([]);
  const [mappedUsers, setMappedUsers] = useState([]);
  const [columnMap, setColumnMap] = useState({});
  const navigate = useNavigate();
  const steps = [
    {
      title: "Upload File",
      icon: <UploadOutlined />,
      content: (
        <ImportStep1Upload
          setRawData={setRawData}
          setCurrentStep={setCurrentStep}
        />
      ),
    },
    {
      title: "Map Columns",
      icon: <SwapOutlined />,
      content: (
        <ImportStep2Mapping
          rawData={rawData}
          setColumnMap={setColumnMap}
          setCurrentStep={setCurrentStep}
        />
      ),
    },
    {
      title: "Review",
      icon: <EyeOutlined />,
      content: (
        <ImportStep3Preview
          rawData={rawData}
          columnMap={columnMap}
          setMappedUsers={setMappedUsers}
          setCurrentStep={setCurrentStep}
        />
      ),
    },
    {
      title: "Import",
      icon: <CheckCircleOutlined />,
      content: (
        <ImportStep4Result
          mappedUsers={mappedUsers}
          setCurrentStep={setCurrentStep}
        />
      ),
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1
          className="text-3xl font-bold"
          style={{
            backgroundImage: "linear-gradient(90deg,#3182ED,#43D08A)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Import Users
        </h1>
        <Button onClick={() => navigate("/admin/users")}>Back to Users</Button>
      </div>

      <Steps
        current={currentStep}
        items={steps.map((s, i) => ({
          title: s.title,
          icon: s.icon,
          status:
            i < currentStep ? "finish" : i === currentStep ? "process" : "wait",
        }))}
      />

      <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-8 mt-6">
        {steps[currentStep].content}
      </div>
    </div>
  );
};

export default ImportUsers;
