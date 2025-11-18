import React, { useCallback, useMemo, useState } from "react";
import { Steps, Button } from "antd";
import {
  UploadOutlined,
  SwapOutlined,
  EyeOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";

import ImportStep1UploadTopic from "../../components/moderator/import/ImportStep1UploadTopic";
import ImportStep2MappingTopic from "../../components/moderator/import/ImportStep2MappingTopic";
import ImportStep3PreviewTopic from "../../components/moderator/import/ImportStep3PreviewTopic";
import ImportStep4ResultTopic from "../../components/moderator/import/ImportStep4ResultTopic";

const ImportTopics = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [rawData, setRawData] = useState([]);
  const [mappedTopics, setMappedTopics] = useState([]);
  const [columnMap, setColumnMap] = useState({});

  const handleSetMappedTopics = useCallback(
    (list) => setMappedTopics(list),
    []
  );

  const steps = useMemo(
    () => [
      {
        title: "Upload File",
        icon: <UploadOutlined />,
        content: (
          <ImportStep1UploadTopic
            setRawData={setRawData}
            setCurrentStep={setCurrentStep}
          />
        ),
      },
      {
        title: "Map Columns",
        icon: <SwapOutlined />,
        content: (
          <ImportStep2MappingTopic
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
          <ImportStep3PreviewTopic
            rawData={rawData}
            columnMap={columnMap}
            setMappedTopics={handleSetMappedTopics}
            setCurrentStep={setCurrentStep}
          />
        ),
      },
      {
        title: "Import",
        icon: <CheckCircleOutlined />,
        content: (
          <ImportStep4ResultTopic
            mappedTopics={mappedTopics}
            setCurrentStep={setCurrentStep}
          />
        ),
      },
    ],
    [rawData, columnMap, handleSetMappedTopics]
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Import Topics</h1>
        <div />
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
