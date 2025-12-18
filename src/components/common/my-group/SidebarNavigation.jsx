import React, { useState } from "react";
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  FileText,
  FolderOpen,
  Menu,
  X,
} from "lucide-react";

export default function SidebarNavigation({ activeTab, onChange, tabs, t }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const iconMap = {
    overview: LayoutDashboard,
    members: Users,
    workspace: FolderKanban,
    posts: FileText,
    files: FolderOpen,
  };

  const handleTabChange = (tabKey) => {
    onChange(tabKey);
    setIsMobileOpen(false); // Close mobile menu after selection
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-20 left-4 z-50 p-2 bg-white rounded-lg shadow-md border border-gray-200 hover:bg-gray-50 transition"
        aria-label="Toggle menu"
      >
        {isMobileOpen ? (
          <X className="w-5 h-5 text-gray-700" />
        ) : (
          <Menu className="w-5 h-5 text-gray-700" />
        )}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static top-0 left-0 
          h-screen w-64 bg-white border-r border-gray-200
          z-50 lg:z-auto
          transform transition-transform duration-300 ease-in-out
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          overflow-y-auto
          shadow-lg lg:shadow-none
        `}
      >
        <div className="p-4 lg:p-6">
          <div className="mb-6 hidden lg:block">
            <h2 className="text-lg font-semibold text-gray-900">
              {t("navigation") || "Navigation"}
            </h2>
          </div>

          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = iconMap[tab.key] || LayoutDashboard;
              const isActive = activeTab === tab.key;

              return (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg
                    text-sm font-medium transition-all duration-200
                    ${
                      isActive
                        ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    }
                  `}
                >
                  <Icon
                    className={`w-5 h-5 flex-shrink-0 ${
                      isActive ? "text-blue-600" : "text-gray-500"
                    }`}
                  />
                  <span className="capitalize">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}

