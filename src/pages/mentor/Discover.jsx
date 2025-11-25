import React, { useState, useEffect } from "react";
import { Card, Input, Select, Tag, Button, Spin } from "antd";
import {
  SearchOutlined,
  UserOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import GroupDetailModal from "../../components/mentor/GroupDetailModal";
import { GroupService } from "../../services/group.service";
import { useTranslation } from "../../hook/useTranslation";
const { Option } = Select;

const Discover = () => {
  const [filters, setFilters] = useState({
    query: "",
    major: "",
    status: "",
  });
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await GroupService.getListGroup();
      const groupsList = Array.isArray(response?.data) ? response.data : [];

      // Fetch detail for each group to get mentor info
      const groupsWithDetails = await Promise.all(
        groupsList.map(async (group) => {
          try {
            const detailRes = await GroupService.getGroupDetail(group.id);
            const detail = detailRes?.data || {};
            return {
              ...group,
              mentor: detail.mentor,
              mentorId: detail.mentorId,
            };
          } catch (err) {
            console.error(`Failed to fetch detail for group ${group.id}:`, err);
            return group;
          }
        })
      );

      console.log("Groups with mentor info:", groupsWithDetails);
      setGroups(groupsWithDetails);
    } catch (error) {
      console.error("Failed to fetch groups:", error);
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchGroupDetail = async (groupId) => {
    try {
      const response = await GroupService.getGroupDetail(groupId);
      return response?.data || null;
    } catch (error) {
      console.error("Failed to fetch group detail:", error);
      return null;
    }
  };

  const handleViewDetails = async (group) => {
    const detailData = await fetchGroupDetail(group.id);
    if (detailData) {
      setSelectedGroup(detailData);
    }
  };

  const normalizeGroup = (group) => {
    // Check if mentor exists - could be mentor object, mentorId, or other variations
    const mentorExists =
      group.mentor &&
      typeof group.mentor === "object" &&
      Object.keys(group.mentor).length > 0;
    const mentorIdExists = group.mentorId || group.mentor_id;
    const mentorInfoExists =
      group.mentorInfo &&
      typeof group.mentorInfo === "object" &&
      Object.keys(group.mentorInfo).length > 0;

    const hasMentor = Boolean(
      mentorExists || mentorIdExists || mentorInfoExists
    );

    console.log(`Group ${group.name}:`, {
      mentor: group.mentor,
      mentorId: group.mentorId,
      hasMentor,
    }); // Debug each group

    return {
      id: group.id || group.groupId,
      name: group.name || "Unnamed Group",
      shortDesc: group.major?.name || group.field || "No major specified",
      detail: group.description || "No description available",
      members: group.currentMembers || group.members || 0,
      maxMembers: group.maxMembers || 5,
      lastActive: group.updatedAt || group.createdAt || "Unknown",
      major: group.major?.name || group.field || "Unknown",
      urgent: !hasMentor || group.status === "recruiting",
      tags: [],
      status: group.status || "unknown",
      mentor: group.mentor || group.mentorInfo,
      hasMentor: hasMentor,
      topicName: group.topic?.title || group.topicName || "No topic",
    };
  };

  const normalizedGroups = groups.map(normalizeGroup);

  const filteredGroups = normalizedGroups.filter(
    (g) =>
      g.name.toLowerCase().includes(filters.query.toLowerCase()) &&
      (filters.major ? g.major === filters.major : true) &&
      (filters.status === "urgent" ? g.urgent : true)
  );

  return (
    <div className="space-y-8 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="space-y-1 mb-8">
        <h1
          className="inline-block text-4xl font-extrabold"
          style={{
            backgroundImage: "linear-gradient(90deg,#3182ED 0%,#43D08A 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Discover
        </h1>
        <p className="text-gray-500 text-sm">
          Find student groups that need mentoring and make a difference
        </p>
        <p className="text-gray-400 text-xs">
          {normalizedGroups.length} groups available •{" "}
          {normalizedGroups.filter((g) => g.urgent).length} need mentor
        </p>
      </div>

      {/* Filter Section */}
      <Card className="shadow-sm border-gray-100">
        <h3 className="text-gray-800 font-semibold mb-4">
          {t("smartFilters") || "Smart Filters"}
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          <Input
            placeholder={t("searchGroupsTopics") || "Search groups, topics..."}
            prefix={<SearchOutlined />}
            value={filters.query}
            onChange={(e) => setFilters({ ...filters, query: e.target.value })}
          />
          <Select
            placeholder="Major"
            allowClear
            onChange={(val) => setFilters({ ...filters, major: val })}
          >
            <Option value="Computer Science">Computer Science</Option>
            <Option value="Information Systems">Information Systems</Option>
          </Select>
          <Select
            placeholder="Status"
            allowClear
            onChange={(val) => setFilters({ ...filters, status: val })}
          >
            <Option value="urgent">Urgent</Option>
          </Select>
        </div>
      </Card>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-20">
          <Spin size="large" tip="Loading groups..." />
        </div>
      )}

      {/* Cards Section */}
      {!loading && (
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          {filteredGroups.map((g) => (
            <Card
              key={g.id}
              className="shadow-md rounded-2xl border-gray-100 hover:shadow-lg transition-all"
              bodyStyle={{ padding: "20px" }}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-teal-500 inline-block"></span>
                  <h3 className="font-semibold text-gray-800 text-lg">
                    {g.name}
                  </h3>
                </div>
                {g.urgent && (
                  <Tag color="red" className="font-semibold">
                    Urgent
                  </Tag>
                )}
              </div>

              <p className="text-gray-500 text-sm font-medium">{g.shortDesc}</p>
              <p className="text-gray-400 text-sm mt-1">{g.detail}</p>

              <div className="flex items-center gap-4 mt-3 text-gray-500 text-sm">
                <div className="flex items-center gap-1">
                  <UserOutlined />
                  {g.members}
                </div>
                <div className="flex items-center gap-1">
                  <ClockCircleOutlined />
                  {g.lastActive}
                </div>
              </div>

              <div className="mt-2">
                <Tag color="blue" className="rounded-md text-xs">
                  {g.major}
                </Tag>
              </div>

              <div className="flex gap-3 mt-4">
                <Button
                  className={`${
                    !g.hasMentor ? "flex-1" : "w-full"
                  } bg-gray-100 hover:bg-gray-200`}
                  onClick={() => handleViewDetails(g)}
                >
                  View Details
                </Button>
                {!g.hasMentor && (
                  <Button
                    type="primary"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Mentor Now
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {!loading && filteredGroups.length === 0 && (
        <div className="text-center text-gray-400 mt-16">
          No groups found matching your filters.
        </div>
      )}

      {/* Popup chi tiết */}
      <GroupDetailModal
        group={selectedGroup}
        open={!!selectedGroup}
        onClose={() => setSelectedGroup(null)}
      />
    </div>
  );
};

export default Discover;
