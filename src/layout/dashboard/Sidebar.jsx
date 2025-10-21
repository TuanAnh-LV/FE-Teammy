import React, { useState } from "react";
import { Layout, Menu, Button, Tooltip } from "antd";
import { Link, useLocation } from "react-router-dom";
import { getRoleMenus } from "../../consts/roleMenus.jsx";
import { LogoutOutlined } from "@ant-design/icons";

const { Sider } = Layout;

const Sidebar = ({ role, collapsed: collapsedProp, onToggle, onLogout }) => {
  const location = useLocation();
  const menus = getRoleMenus(role);
  const [collapsed, setCollapsed] = useState(false);

  const isCollapsed =
    typeof collapsedProp === "boolean" ? collapsedProp : collapsed;

  return (
    <Sider
      width={240}
      theme="light"
      collapsible
      collapsed={isCollapsed}
      trigger={null}
      collapsedWidth={64}
      breakpoint="md"
      onBreakpoint={(broken) => setCollapsed(broken)}
      onCollapse={(c) => {
        setCollapsed(c);
        onToggle?.();
      }}
      className="border-r border-gray-100 relative flex flex-col"
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100">
        <div className="w-6 h-8 bg-black rounded"></div>
        {!isCollapsed && (
          <div>
            <div className="text-base font-bold text-gray-800 leading-none">
              Teammy
            </div>
            <div className="text-[11px] text-gray-400 -mt-0.5">
              University Capstone Platform
            </div>
          </div>
        )}
      </div>

      {/* Menu chính */}
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        className="mt-2 flex-1"
      >
        {menus.map((m) => {
          const isActive = location.pathname === m.path;
          return (
            <Menu.Item
              key={m.path}
              icon={m.icon}
              className={`!rounded-md ${
                isActive
                  ? "bg-orange-50 text-orange-600"
                  : "text-gray-700 hover:bg-gray-100 hover:text-orange-500"
              }`}
            >
              <Link to={m.path}>{m.label}</Link>
            </Menu.Item>
          );
        })}
      </Menu>

      {/* Nút Logout cố định ở đáy */}
      <div className="absolute bottom-3 left-0 w-full flex justify-center">
        <Tooltip title={!isCollapsed ? "" : "Logout"} placement="right">
          <Button
            type="text"
            icon={<LogoutOutlined style={{ color: "red" }} />}
            onClick={onLogout}
            className={`flex items-center justify-center ${
              !isCollapsed ? "w-[200px]" : "w-full"
            } hover:text-red-500`}
          >
            {!isCollapsed && <span className="text-gray-700">Logout</span>}
          </Button>
        </Tooltip>
      </div>
    </Sider>
  );
};

export default Sidebar;
