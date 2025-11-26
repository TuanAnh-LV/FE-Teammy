import React, { useState } from "react";
import { Layout, Menu, Button, Tooltip } from "antd";
import { Link, useLocation } from "react-router-dom";
import { getRoleMenus } from "../../consts/roleMenus.jsx";
import { LogoutOutlined } from "@ant-design/icons";
import { useLanguage } from "../../context/LanguageContext";
import { getTranslation } from "../../translations";

const { Sider } = Layout;

const Sidebar = ({ role, collapsed: collapsedProp, onToggle, onLogout }) => {
  const location = useLocation();
  const { language } = useLanguage();
  const menus = getRoleMenus(role, language);
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
      <div className="flex items-center gap-2 px-10 py-[18px] border-b border-gray-100">
        {!isCollapsed && (
          <div>
            <div className="text-base font-black text-gray-800 leading-none">
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
        items={menus.map((m) => {
          const isActive = location.pathname === m.path;
          return {
            key: m.path,
            icon: m.icon,
            label: <Link to={m.path}>{m.label}</Link>,
            className: `!rounded-md ${
              isActive ? "bg-orange-50 text-white-600" : "hover:text-white"
            }`,
          };
        })}
      />

      {/* Nút Logout cố định ở đáy */}
      <div className="absolute bottom-3 left-0 w-full flex justify-center">
        <Tooltip
          title={!isCollapsed ? "" : getTranslation("logout", language)}
          placement="right"
        >
          <Button
            type="text"
            icon={<LogoutOutlined style={{ color: "red" }} />}
            onClick={onLogout}
            className={`flex items-center justify-center ${
              !isCollapsed ? "w-[200px]" : "w-full"
            } hover:text-red-500`}
          >
            {!isCollapsed && (
              <span className="text-gray-700">
                {getTranslation("logout", language)}
              </span>
            )}
          </Button>
        </Tooltip>
      </div>
    </Sider>
  );
};

export default Sidebar;
