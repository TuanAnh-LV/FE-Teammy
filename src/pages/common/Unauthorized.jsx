import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "antd";
import { LockOutlined, HomeOutlined } from "@ant-design/icons";

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
      <div className="text-center px-6">
        <div className="mb-8">
          <LockOutlined className="text-8xl text-orange-500 animate-pulse" />
        </div>

        <h1 className="text-6xl font-black text-gray-800 mb-4">403</h1>

        <h2 className="text-3xl font-bold text-gray-700 mb-4">Access Denied</h2>

        <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
          Bạn không có quyền truy cập vào trang này. Vui lòng kiểm tra lại quyền
          hạn của bạn.
        </p>

        <div className="flex gap-4 justify-center">
          <Button
            type="default"
            size="large"
            icon={<HomeOutlined />}
            onClick={() => navigate(-1)}
            className="!border-gray-300 hover:!border-orange-400 hover:!text-orange-400"
          >
            Go Back
          </Button>

          <Button
            type="primary"
            size="large"
            icon={<HomeOutlined />}
            onClick={() => navigate("/")}
            className="!bg-[#FF7A00] hover:!opacity-90"
          >
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
