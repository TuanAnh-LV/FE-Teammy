import React, { useState, useCallback, useMemo } from "react";
import { Steps, Button } from "antd";
import {
  UploadOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";

import ImportStep1Upload from "../../components/admin/import/ImportStep1Upload";
import ImportStep3Preview from "../../components/admin/import/ImportStep3Preview";
import ImportStep4Result from "../../components/admin/import/ImportStep4Result";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "../../hook/useTranslation";

const ImportUsers = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [rawData, setRawData] = useState([]);
  const [uploadedUsers, setUploadedUsers] = useState([]);
  const [mappedUsers, setMappedUsers] = useState([]);
  const [validationResult, setValidationResult] = useState(null);
  const [originalFile, setOriginalFile] = useState(null);
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleSetMappedUsers = useCallback((users) => {
    setMappedUsers(users);
  }, []);

  const steps = useMemo(
    () => [
      {
        title: t("uploadFile") || "Upload File",
        icon: <UploadOutlined />,
        content: (
          <ImportStep1Upload
            setRawData={setRawData}
            setUploadedUsers={setUploadedUsers}
            setValidationResult={setValidationResult}
            setOriginalFile={setOriginalFile}
            setCurrentStep={setCurrentStep}
          />
        ),
      },
      {
        title: t("review") || "Review",
        icon: <EyeOutlined />,
        content: (
          <ImportStep3Preview
            uploadedUsers={uploadedUsers}
            validationResult={validationResult}
            setMappedUsers={handleSetMappedUsers}
            setCurrentStep={setCurrentStep}
            originalFile={originalFile}
          />
        ),
      },
      {
        title: t("import") || "Import Users",
        icon: <CheckCircleOutlined />,
        content: (
          <ImportStep4Result
            mappedUsers={mappedUsers}
            setCurrentStep={setCurrentStep}
          />
        ),
      },
    ],
    [
      rawData,
      uploadedUsers,
      validationResult,
      mappedUsers,
      originalFile,
      handleSetMappedUsers,
    ]
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">
          {t("importUsers") || "Import Users"}
        </h1>

        <Button
          type="default"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/admin/users")}
          className="mt-2 sm:mt-0 !border-gray-300 hover:!border-orange-400 hover:!text-orange-500"
        >
          {t("backToUsers") || "Back to Users"}
        </Button>
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
