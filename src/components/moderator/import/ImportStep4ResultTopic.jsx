import React from "react";
import { Button } from "antd";
import { CheckCircleTwoTone } from "@ant-design/icons";

export default function ImportStep4ResultTopic({
  mappedTopics,
  setCurrentStep,
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20">
      <CheckCircleTwoTone
        twoToneColor="#43D08A"
        style={{ fontSize: 80, marginBottom: 16 }}
      />
      <h2 className="text-2xl font-semibold text-gray-800">
        Import Successful
      </h2>
      <p className="text-gray-500 mb-8">
        {mappedTopics.length} topics have been imported (or scheduled).
      </p>
      <Button
        size="large"
        className="!bg-[#FF7A00] !text-white !border-none !rounded-md !px-6 !py-2 hover:!opacity-90"
        onClick={() => setCurrentStep(0)}
      >
        Back to Upload
      </Button>
    </div>
  );
}
