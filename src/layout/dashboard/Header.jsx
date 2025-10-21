import React from "react";
import { Layout, Avatar } from "antd";
import {
  BellOutlined,
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";

const { Header } = Layout;

const HeaderBar = ({ collapsed, onToggle }) => {
  return (
    <Header
      className="bg-white border-b border-gray-100 px-6 flex items-center justify-between top-0 z-50"
      style={{
        height: "64px",
        lineHeight: "64px",
        background: "#ffffff",
        padding: "0 24px",
      }}
    >
      {/* Left side */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggle}
          className="text-gray-600 hover:text-blue-600 transition"
          aria-label="Toggle sidebar"
        >
          {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </button>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        <BellOutlined className="text-gray-500 text-lg cursor-pointer hover:text-blue-600 transition" />
        <Avatar size="small" icon={<UserOutlined />} />
      </div>
    </Header>
  );
};

export default HeaderBar;
