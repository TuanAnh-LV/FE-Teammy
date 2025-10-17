import React, { useState } from "react";
import { Layout, Menu } from "antd";
import { Link, useLocation } from "react-router-dom";
import { getRoleMenus } from "../../consts/roleMenus.jsx";

const { Sider } = Layout;

const Sidebar = ({ role, collapsed: collapsedProp, onToggle }) => {
  const location = useLocation();
  const menus = getRoleMenus(role);
  const [collapsed, setCollapsed] = useState(false);

  // Ưu tiên state từ parent nếu truyền vào
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
      onBreakpoint={(broken) => {
        setCollapsed(broken);
      }}
      onCollapse={(c) => {
        setCollapsed(c);
        onToggle?.();
      }}
      className="border-r border-gray-100"
    >
      {/* Logo + brand */}
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

      {/* Menu */}
      <Menu mode="inline" selectedKeys={[location.pathname]} className="mt-2">
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

      {/* Footer nhỏ trong sidebar */}
      {!isCollapsed && (
        <div className="mt-auto text-center text-gray-400 text-xs py-3 border-t border-gray-100">
          © {new Date().getFullYear()} Teammy
        </div>
      )}
    </Sider>
  );
};

export default Sidebar;
