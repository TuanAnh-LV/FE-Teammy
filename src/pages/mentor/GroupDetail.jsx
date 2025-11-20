import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Tabs, Button, Breadcrumb, Spin } from "antd";
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
import { GroupService } from "../../services/group.service";

export default function GroupDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [groupDetail, setGroupDetail] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchGroupDetail();
    }
  }, [id]);

  const fetchGroupDetail = async () => {
    try {
      setLoading(true);
      const response = await GroupService.getGroupDetail(id);
      setGroupDetail(response?.data || null);
    } catch (error) {
      console.error("Failed to fetch group detail:", error);
      setGroupDetail(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" tip="Loading group details..." />
      </div>
    );
  }

  const groupName = groupDetail?.name || `Group #${id}`;
  const groupDescription = groupDetail?.description || "View project overview, timeline, and member contributions.";

  const items = [
    {
      key: "overview",
      label: (
        <span>
          <BarChartOutlined /> Overview
        </span>
      ),
      children: <GroupOverview groupId={id} groupDetail={groupDetail} />,
    },
    {
      key: "timeline",
      label: (
        <span>
          <ClockCircleOutlined /> Timeline & Tasks
        </span>
      ),
      children: <GroupTimeline groupId={id} groupDetail={groupDetail} />,
    },
    {
      key: "contributions",
      label: (
        <span>
          <MessageOutlined /> Contributions & Chat
        </span>
      ),
      children: <GroupContributions groupId={id} groupDetail={groupDetail} />,
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
              <span className="font-semibold text-gray-700">{groupName}</span>
            ),
          },
        ]}
      />

      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-extrabold mb-1">
            {groupName} – Progress Monitoring
          </h1>
          <p className="text-gray-500 text-sm">
            {groupDescription}
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
