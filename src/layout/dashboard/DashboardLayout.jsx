import React, { useState } from "react";
import { Layout } from "antd";
import Sidebar from "./Sidebar";
import HeaderBar from "./Header";
import { Outlet } from "react-router-dom";

const { Content } = Layout;

const DashboardLayout = ({ role }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout className="h-screen overflow-hidden">
      {" "}
      <Sidebar
        role={role}
        collapsed={collapsed}
        onToggle={() => setCollapsed((v) => !v)}
      />
      <Layout className="flex flex-col h-screen">
        <HeaderBar
          role={role}
          collapsed={collapsed}
          onToggle={() => setCollapsed((v) => !v)}
        />

        <Content
          className="overflow-y-auto bg-white p-3"
          style={{
            height: "calc(100vh - 64px)",
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default DashboardLayout;
