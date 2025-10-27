import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Tabs, Button, Breadcrumb } from "antd";
import {
  ArrowLeftOutlined,
  BarChartOutlined,
  ClockCircleOutlined,
  MessageOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import GroupOverview from "../../components/mentor/GroupOverview";
import GroupTimeline from "../../components/mentor/GroupTimeline";
import GroupContributions from "../../components/mentor/GroupContributions";

export default function GroupDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  const items = [
    {
      key: "overview",
      label: (
        <span>
          <BarChartOutlined /> Overview
        </span>
      ),
      children: <GroupOverview groupId={id} />,
    },
    {
      key: "timeline",
      label: (
        <span>
          <ClockCircleOutlined /> Timeline & Tasks
        </span>
      ),
      children: <GroupTimeline groupId={id} />,
    },
    {
      key: "contributions",
      label: (
        <span>
          <MessageOutlined /> Contributions & Chat
        </span>
      ),
      children: <GroupContributions groupId={id} />,
    },
  ];

  return (
    <div className="bg-[#f8fafc] min-h-screen space-y-6 animate-fadeIn">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          {
            title: (
              <span
                className="cursor-pointer text-gray-500 hover:text-blue-600"
                onClick={() => navigate("/mentor/my-groups")}
              >
                <HomeOutlined /> My Groups
              </span>
            ),
          },
          {
            title: (
              <span className="font-semibold text-gray-700">Group #{id}</span>
            ),
          },
        ]}
      />

      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-extrabold mb-1">
            Group #{id} – Progress Monitoring
          </h1>
          <p className="text-gray-500 text-sm">
            View project overview, timeline, and member contributions.
          </p>
        </div>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/mentor/my-groups")}
          className="rounded-lg shadow-sm"
        >
          Back
        </Button>
      </div>

      {/* Tabs */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={items}
        type="line"
        className="bg-white rounded-2xl shadow-sm p-6 mt-4 !mb-0 custom-tabs"
        tabBarStyle={{ marginBottom: 24, paddingInline: 16 }}
      />
    </div>
  );
}
