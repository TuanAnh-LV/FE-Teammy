import React, { useCallback, useMemo, useState } from "react";
import { Steps, Button } from "antd";
import {
  UploadOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";

import ImportStep1UploadTopic from "../../components/moderator/import/ImportStep1UploadTopic";
import ImportStep3PreviewTopic from "../../components/moderator/import/ImportStep3PreviewTopic";
import ImportStep4ResultTopic from "../../components/moderator/import/ImportStep4ResultTopic";
import { useTranslation } from "../../hook/useTranslation";
import { useNavigate } from "react-router-dom";

const ImportTopics = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [rawData, setRawData] = useState([]);
  const [uploadedTopics, setUploadedTopics] = useState([]);
  const [mappedTopics, setMappedTopics] = useState([]);
  const [validationResult, setValidationResult] = useState(null);
  const [originalFile, setOriginalFile] = useState(null);

  const handleSetMappedTopics = useCallback(
    (list) => setMappedTopics(list),
    []
  );

  const steps = useMemo(
    () => [
      {
        title: t("uploadFile") || "Upload File",
        icon: <UploadOutlined />,
        content: (
          <ImportStep1UploadTopic
            setRawData={setRawData}
            setUploadedTopics={setUploadedTopics}
            setValidationResult={setValidationResult}
            setCurrentStep={setCurrentStep}
            setOriginalFile={setOriginalFile}
          />
        ),
      },
      {
        title: t("review") || "Review",
        icon: <EyeOutlined />,
        content: (
          <ImportStep3PreviewTopic
            uploadedTopics={uploadedTopics}
            setMappedTopics={handleSetMappedTopics}
            setCurrentStep={setCurrentStep}
            validationResult={validationResult}
            originalFile={originalFile}
          />
        ),
      },
      {
        title: t("import") || "Import",
        icon: <CheckCircleOutlined />,
        content: (
          <ImportStep4ResultTopic
            mappedTopics={mappedTopics}
            setCurrentStep={setCurrentStep}
          />
        ),
      },
    ],
    [
      t,
      rawData,
      uploadedTopics,
      validationResult,
      originalFile,
      mappedTopics,
      handleSetMappedTopics,
    ]
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">
          {t("importTopics") || "Import Topics"}
        </h1>

        <Button
          type="default"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/moderator/topic")}
          className="mt-2 sm:mt-0 !border-gray-300 hover:!border-orange-400 hover:!text-orange-500"
        >
          {t("backToTopics") || "Back to Topics"}
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

export default ImportTopics;
