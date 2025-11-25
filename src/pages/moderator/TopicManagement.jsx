import React, { useMemo, useState, useEffect } from "react";
import { useTranslation } from "../../hook/useTranslation";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Table,
  Input,
  Select,
  Button,
  Space,
  Tooltip,
  notification,
} from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  CopyOutlined,
  UploadOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import TopicDetailModal from "../../components/moderator/TopicDetailModal";
import { TopicService } from "../../services/topic.service";
import { downloadBlob } from "../../utils/download";
import * as XLSX from "xlsx";
const { Option } = Select;

const TopicManagement = () => {
  const [filters, setFilters] = useState({
    status: "All Status",
    search: "",
  });

  const { t } = useTranslation();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentTopic, setCurrentTopic] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    const fetchTopics = async () => {
      setLoading(true);
      try {
        const res = await TopicService.getTopics();
        const payload = res?.data ?? res;
        const list = Array.isArray(payload) ? payload : payload?.data ?? [];

        const mapped = (list || []).map((t, idx) => ({
          key: t.topicId || idx,
          topicName: t.title || "",
          description: t.description || "",
          mentorName:
            (t.mentors && t.mentors.length > 0
              ? t.mentors.map((m) => m.mentorName).join(", ")
              : "") ||
            t.createdByName ||
            "",
          majorName: t.majorName || "",
          createdAt: t.createdAt ? t.createdAt.slice(0, 10) : "",
          status:
            t.status === "open"
              ? "Available"
              : t.status === "closed"
              ? "Not Available"
              : t.status || "Available",
          raw: t,
        }));

        if (mounted) setTopics(mapped);
      } catch (err) {
        console.error(err);
        notification.error({
          message: t("failedLoadTopics") || "Failed to load topics",
        });
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchTopics();
    return () => {
      mounted = false;
    };
  }, []);

  const data = topics;

  // Determine status: prefer explicit `status` field, fallback to 'Available'
  const getStatus = (row) => row?.status || "Available";

  // Lọc theo search + status (status không cần hiển thị trong table)
  const filteredData = useMemo(() => {
    const s = filters.search.toLowerCase().trim();

    return data.filter((item) => {
      const searchMatch =
        item.topicName.toLowerCase().includes(s) ||
        item.mentorName.toLowerCase().includes(s) ||
        item.majorName.toLowerCase().includes(s);

      const statusStr = getStatus(item);
      const statusMatch =
        filters.status === "All Status" || statusStr === filters.status;

      return searchMatch && statusMatch;
    });
  }, [data, filters]);

  const columns = [
    {
      title: "Topic",
      dataIndex: "topicName",
      key: "topicName",
      render: (text) => (
        <span className="font-medium text-gray-800 hover:text-blue-600 transition">
          {text}
        </span>
      ),
    },
    { title: "Mentor", dataIndex: "mentorName", key: "mentorName" },
    { title: "Major", dataIndex: "majorName", key: "majorName" },
    { title: "Created Date", dataIndex: "createdAt", key: "createdAt" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            status === "Available"
              ? "text-green-600 bg-green-50"
              : "text-orange-600 bg-orange-50"
          }`}
        >
          {status}
        </span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title={t("viewDetails") || "View details"}>
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => {
                setCurrentTopic(record); // Set the selected topic
                setIsModalVisible(true); // Open modal
              }}
            />
          </Tooltip>
          <Tooltip title={t("copyTopic") || "Copy topic"}>
            <Button type="text" icon={<CopyOutlined />} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="inline-block text-4xl font-extrabold">
          Topic Management
        </h1>
        <Space>
          <Button
            icon={<UploadOutlined />}
            className="!border-gray-300 hover:!border-orange-400 hover:!text-orange-400 transition-all !py-5"
            onClick={() => navigate("/moderator/import-topics")}
          >
            Import topics
          </Button>

          <Button
            icon={<DownloadOutlined />}
            className="!border-gray-300 hover:!border-orange-400 hover:!text-orange-400 transition-all !py-5"
            onClick={async () => {
              try {
                const res = await TopicService.exportTopics();
                const blob = res?.data ?? res;
                const disposition = res?.headers?.["content-disposition"];
                downloadBlob(blob, "TeammyTopicsTemplate.xlsx", disposition);
                notification.success({
                  message: t("templateDownloaded") || "Template downloaded",
                });
              } catch (err) {
                console.error(err);
                // Fallback: generate a small template and download
                const template = [
                  {
                    title: "AI Capstone",
                    description: "Create AI",
                    majorName: "Software Engineering",
                    createdByName: "Alice Nguyen",
                    status: "open",
                  },
                ];
                const ws = XLSX.utils.json_to_sheet(template);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, "Template");
                XLSX.writeFile(wb, "TeammyTopicsTemplate.xlsx");
                notification.warning({
                  message:
                    t("templateGeneratedLocally") ||
                    "Template generated locally (API error)",
                });
              }
            }}
          >
            Export template
          </Button>
        </Space>
      </div>

      {/* Layout: Table */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <Card
          className="xl:col-span-3 shadow-sm border-gray-100 rounded-lg"
          bodyStyle={{ padding: "20px 24px" }}
        >
          <div className="flex flex-col sm:flex-row justify-between gap-3 mb-4">
            <Input
              prefix={<SearchOutlined className="text-gray-400" />}
              placeholder={
                t("searchByTopicOrMentor") ||
                "Search by topic title or mentor..."
              }
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              className="sm:w-1/2"
            />
            <div className="flex gap-2">
              <Select
                value={filters.status}
                onChange={(v) => setFilters({ ...filters, status: v })}
                className="w-40"
              >
                <Option value="All Status">
                  {t("allStatus") || "All Status"}
                </Option>
                <Option value="Available">
                  {t("available") || "Available"}
                </Option>
                <Option value="Not Available">
                  {t("notAvailable") || "Not Available"}
                </Option>
              </Select>
            </div>
          </div>

          <Table
            rowKey="key"
            columns={columns}
            dataSource={filteredData}
            loading={loading}
            pagination={false}
            bordered
            className="rounded-lg"
          />
        </Card>

        {/* Sidebar Summary (tuỳ chọn) */}
        <div className="flex flex-col gap-6">
          <Card className="shadow-sm border-gray-100 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-3">Summary</h3>
            {/* Có thể tính lại theo filteredData nếu muốn thống kê theo filter hiện tại */}
            <p className="text-sm text-gray-600">
              Total Topics:{" "}
              <span className="font-semibold text-gray-800">{data.length}</span>
            </p>
            <p className="text-sm text-gray-600">
              Assigned:{" "}
              <span className="font-semibold text-green-600">
                {data.filter((d) => getStatus(d) === "Not Available").length}
              </span>
            </p>
            <p className="text-sm text-gray-600">
              Available:{" "}
              <span className="font-semibold text-orange-500">
                {data.filter((d) => getStatus(d) === "Available").length}
              </span>
            </p>
          </Card>
        </div>
      </div>
      <TopicDetailModal
        open={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        topicDetails={currentTopic}
        topicId={currentTopic?.key}
      />
    </div>
  );
};

export default TopicManagement;
