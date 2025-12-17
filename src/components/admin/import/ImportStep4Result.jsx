import React from "react";
import { Result, Button } from "antd";
import { CheckCircleTwoTone } from "@ant-design/icons";
import { useTranslation } from "../../../hook/useTranslation";
import { useNavigate } from "react-router-dom";
export default function ImportStep4Result({ mappedUsers }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center text-center py-20">
      <CheckCircleTwoTone
        twoToneColor="#43D08A"
        style={{ fontSize: 80, marginBottom: 16 }}
      />
      <h2 className="text-2xl font-semibold text-gray-800">
        {t("importSuccessful") || "Import Successful"}
      </h2>
      <p className="text-gray-500 mb-8">
        {t("usersAddedSuccessfully", { count: mappedUsers.length }) ||
          `${mappedUsers.length} users have been added successfully.`}
      </p>
      <Button
        size="large"
        className="!bg-[#FF7A00] !text-white !border-none !rounded-md !px-6 !py-2 hover:!opacity-90"
        onClick={() => navigate("/admin/users")}
      >
        {t("backToUsers") || "Back to Users"}
      </Button>
    </div>
  );
}
