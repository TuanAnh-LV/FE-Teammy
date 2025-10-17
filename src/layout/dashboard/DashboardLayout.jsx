import React, { useState } from "react";
import { Layout } from "antd";
import Sidebar from "./Sidebar";
import HeaderBar from "./Header";
import { Outlet } from "react-router-dom";

const { Content } = Layout;

const DashboardLayout = ({ role }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout hasSider className="min-h-screen bg-gray-50">
      <Sidebar
        role={role}
        collapsed={collapsed}
        onToggle={() => setCollapsed((v) => !v)}
      />

      <Layout>
        <HeaderBar
          role={role}
          collapsed={collapsed}
          onToggle={() => setCollapsed((v) => !v)}
        />

        <Content className="p-8 bg-gray-50">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default DashboardLayout;
