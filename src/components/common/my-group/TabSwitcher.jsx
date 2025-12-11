import React from "react";

export default function TabSwitcher({ activeTab, onChange, tabs }) {
  return (
    <div className="inline-flex gap-0 bg-[#f3f5f6] rounded-lg border border-gray-200 mb-6 overflow-hidden">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`px-16 py-2 text-sm font-semibold capitalize transition ${
            activeTab === tab.key
              ? "bg-white text-gray-900 font-semibold"
              : "text-gray-600 hover:bg-white/60"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
