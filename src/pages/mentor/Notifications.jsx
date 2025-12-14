import React, { useState } from "react";
import { Card, Switch, Button } from "antd";

const Notifications = () => {
  const [settings, setSettings] = useState({
    application: { inApp: true, email: true },
    tasks: { inApp: true, email: false },
    deadlines: { inApp: true, email: false },
    digest: { inApp: true, email: false },
  });

  const handleToggle = (section, key) => {
    setSettings((prev) => ({
      ...prev,
      [section]: { ...prev[section], [key]: !prev[section][key] },
    }));
  };

  const handleSave = () => {};

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1
            className="inline-block text-4xl font-extrabold"
            style={{
              backgroundImage: "linear-gradient(90deg,#3182ED 0%,#43D08A 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
              color: "transparent",
            }}
          >
            Notification & Digest
          </h1>
          <p className="text-gray-500 text-sm">
            Manage your notification preferences and digest settings
          </p>
        </div>
        <Button
          type="default"
          className="!text-white !bg-gradient-to-r from-[#3182ED] to-[#43D08A]
             hover:!opacity-90 !shadow-sm !border-none !rounded-lg
             !px-6 !py-2 transition-all duration-200 font-medium"
          onClick={handleSave}
        >
          Save Settings
        </Button>
      </div>

      {/* Content layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Quick Overview */}
        <Card
          className="shadow-sm border-gray-100 lg:col-span-1"
          style={{ padding: "20px" }}
        >
          <h3 className="font-semibold text-gray-800 mb-4">Quick Overview</h3>

          <div className="space-y-2 text-sm text-gray-600">
            <p>
              In-App Notifications:{" "}
              <span className="font-semibold text-gray-800">
                {Object.values(settings).filter((s) => s.inApp).length}
                /4
              </span>
            </p>
            <p>
              Email Notifications:{" "}
              <span className="font-semibold text-gray-800">
                {Object.values(settings).filter((s) => s.email).length}
                /4
              </span>
            </p>
          </div>

          <div className="mt-6 border-t pt-3 text-sm">
            <p className="text-gray-500 mb-1">Next digest:</p>
            <p className="font-medium text-gray-800">Monday, Sep 22, 9:00 AM</p>
          </div>
        </Card>

        {/* Right: Notifications sections */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* 1. Application & Assignment */}
          <Card
            className="shadow-sm border-gray-100"
            style={{ padding: "20px" }}
          >
            <h3 className="font-semibold text-gray-800">
              Application & Assignment Notifications
            </h3>
            <p className="text-sm text-gray-500 mb-3">
              Get notified when groups apply for mentorship or when you’re
              assigned to new groups
            </p>
            <div className="flex items-center justify-between border-t pt-3">
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-gray-700">
                  In-App Notifications
                </span>
                <span className="text-sm font-medium text-gray-700">
                  Email Notifications
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <Switch
                  checked={settings.application.inApp}
                  onChange={() => handleToggle("application", "inApp")}
                />
                <Switch
                  checked={settings.application.email}
                  onChange={() => handleToggle("application", "email")}
                />
              </div>
            </div>
          </Card>

          {/* 2. Task Events */}
          <Card
            className="shadow-sm border-gray-100"
            style={{ padding: "20px" }}
          >
            <h3 className="font-semibold text-gray-800">Task Events</h3>
            <p className="text-sm text-gray-500 mb-3">
              Notifications for task creation, completion, and status changes
              within your groups
            </p>
            <div className="flex items-center justify-between border-t pt-3">
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-gray-700">
                  In-App Notifications
                </span>
                <span className="text-sm font-medium text-gray-700">
                  Email Notifications
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <Switch
                  checked={settings.tasks.inApp}
                  onChange={() => handleToggle("tasks", "inApp")}
                />
                <Switch
                  checked={settings.tasks.email}
                  onChange={() => handleToggle("tasks", "email")}
                />
              </div>
            </div>
          </Card>

          {/* 3. Deadlines & Reminders */}
          <Card
            className="shadow-sm border-gray-100"
            style={{ padding: "20px" }}
          >
            <h3 className="font-semibold text-gray-800">
              Deadlines & Reminders
            </h3>
            <p className="text-sm text-gray-500 mb-3">
              Important deadline reminders for milestones and project
              deliverables
            </p>
            <div className="flex items-center justify-between border-t pt-3">
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-gray-700">
                  In-App Notifications
                </span>
                <span className="text-sm font-medium text-gray-700">
                  Email Notifications
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <Switch
                  checked={settings.deadlines.inApp}
                  onChange={() => handleToggle("deadlines", "inApp")}
                />
                <Switch
                  checked={settings.deadlines.email}
                  onChange={() => handleToggle("deadlines", "email")}
                />
              </div>
            </div>
          </Card>

          {/* 4. Weekly Digest */}
          <Card
            className="shadow-sm border-gray-100"
            style={{ padding: "20px" }}
          >
            <h3 className="font-semibold text-gray-800">Weekly Digest</h3>
            <p className="text-sm text-gray-500 mb-3">
              Weekly summary of group activities, progress updates, and upcoming
              events
            </p>
            <div className="flex items-center justify-between border-t pt-3">
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-gray-700">
                  In-App Digest
                </span>
                <span className="text-sm font-medium text-gray-700">
                  Email Digest
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <Switch
                  checked={settings.digest.inApp}
                  onChange={() => handleToggle("digest", "inApp")}
                />
                <Switch
                  checked={settings.digest.email}
                  onChange={() => handleToggle("digest", "email")}
                />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
