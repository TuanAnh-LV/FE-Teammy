import React, { useState, useEffect, useCallback } from "react";
import {
  Table,
  Button,
  Space,
  Card,
  notification,
  Tag,
  Form,
  Input,
  Select,
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  EyeOutlined,
  SettingOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { SemesterService } from "../../services/semester.service";
import { useTranslation } from "../../hook/useTranslation";
import SemesterDetailModal from "../../components/admin/SemesterDetailModal";
import SemesterFormModal from "../../components/admin/SemesterFormModal";
import SemesterPolicyModal from "../../components/admin/SemesterPolicyModal";
import dayjs from "dayjs";

const { Option } = Select;

const ManageSemesters = () => {
  const { t } = useTranslation();
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [modalMode, setModalMode] = useState("create");
  const [form] = Form.useForm();
  const [policyForm] = Form.useForm();
  const [filters, setFilters] = useState({
    search: "",
    status: "All Status",
    season: "All Seasons",
  });
  const [detailLoading, setDetailLoading] = useState(false);
  const [savingSemester, setSavingSemester] = useState(false);
  const [savingPolicy, setSavingPolicy] = useState(false);
  useEffect(() => {
    fetchSemesters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchSemesters = async () => {
    setLoading(true);
    try {
      const response = await SemesterService.list();
      const data = response?.data || [];
      setSemesters(Array.isArray(data) ? data : []);
    } catch {
      notification.error({
        message: t("error") || "Error",
        description: t("failedToFetchSemesters") || "Failed to fetch semesters",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setModalMode("create");
    setSelectedSemester(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (record) => {
    setModalMode("edit");
    setSelectedSemester(record);
    form.setFieldsValue({
      season: record.season,
      year: record.year,
      startDate: record.startDate ? dayjs(record.startDate) : null,
      endDate: record.endDate ? dayjs(record.endDate) : null,
    });
    setIsModalOpen(true);
  };

  const handleView = async (record) => {
    setIsDetailModalOpen(true);
    setDetailLoading(true);
    try {
      const res = await SemesterService.detail(record.semesterId);
      setSelectedSemester(res?.data ?? record);
    } catch {
      setSelectedSemester(record);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCloseDetail = useCallback(() => {
    setIsDetailModalOpen(false);
    setSelectedSemester(null);
  }, []);

  const handleManagePolicy = async (record) => {
    setSelectedSemester(record);
    try {
      const response = await SemesterService.detail(record.semesterId);
      const data = response?.data || record;
      setSelectedSemester(data);
      const policy = data.policy || {};
      policyForm.setFieldsValue({
        teamSelfSelectStart: policy.teamSelfSelectStart
          ? dayjs(policy.teamSelfSelectStart)
          : null,
        teamSelfSelectEnd: policy.teamSelfSelectEnd
          ? dayjs(policy.teamSelfSelectEnd)
          : null,
        teamSuggestStart: policy.teamSuggestStart
          ? dayjs(policy.teamSuggestStart)
          : null,
        topicSelfSelectStart: policy.topicSelfSelectStart
          ? dayjs(policy.topicSelfSelectStart)
          : null,
        topicSelfSelectEnd: policy.topicSelfSelectEnd
          ? dayjs(policy.topicSelfSelectEnd)
          : null,
        topicSuggestStart: policy.topicSuggestStart
          ? dayjs(policy.topicSuggestStart)
          : null,
        desiredGroupSizeMin: policy.desiredGroupSizeMin,
        desiredGroupSizeMax: policy.desiredGroupSizeMax,
      });

      setIsPolicyModalOpen(true);
    } catch {
      notification.error({
        message: t("error") || "Error",
        description: t("failedToFetchPolicy") || "Failed to fetch policy",
      });
    }
  };

  const handleSubmit = async () => {
    let values;
    try {
      values = await form.validateFields();
    } catch (validationError) {
      if (validationError?.errorFields) return;
      throw validationError;
    }
    const season = values.season;
    const year = values.year;

    const isDuplicate = semesters.some((s) => {
      const sameSeason =
        (s.season || "").toLowerCase() === (season || "").toLowerCase();
      const sameYear = Number(s.year) === Number(year);

      const notSelf =
        modalMode !== "edit" || s.semesterId !== selectedSemester?.semesterId;

      return sameSeason && sameYear && notSelf;
    });

    if (isDuplicate) {
      notification.error({
        message: "Duplicate semester",
        description: `Semester ${season} ${year} already exists.`,
      });
      return;
    }
    setSavingSemester(true);
    try {
      const payload = {
        season: values.season,
        year: values.year,
        startDate: values.startDate
          ? values.startDate.format("YYYY-MM-DD")
          : null,
        endDate: values.endDate ? values.endDate.format("YYYY-MM-DD") : null,
      };

      if (modalMode === "create") {
        await SemesterService.create(payload);
        notification.success({
          message: t("success") || "Success",
          description: t("semesterCreated") || "Semester created successfully",
        });
      } else if (modalMode === "edit") {
        await SemesterService.update(selectedSemester.semesterId, payload);
        notification.success({
          message: t("success") || "Success",
          description: t("semesterUpdated") || "Semester updated successfully",
        });
      }

      setIsModalOpen(false);
      fetchSemesters();
      form.resetFields();
    } catch {
      notification.error({
        message: t("error") || "Error",
        description: t("failedToSaveSemester") || "Failed to save semester",
      });
    } finally {
      setSavingSemester(false);
    }
  };

  const handlePolicySubmit = async () => {
    let values;
    try {
      values = await policyForm.validateFields();
    } catch (validationError) {
      if (validationError?.errorFields) return;
      throw validationError;
    }
    setSavingPolicy(true);
    try {
      const payload = {
        teamSelfSelectStart: values.teamSelfSelectStart
          ? values.teamSelfSelectStart.format("YYYY-MM-DD")
          : null,
        teamSelfSelectEnd: values.teamSelfSelectEnd
          ? values.teamSelfSelectEnd.format("YYYY-MM-DD")
          : null,
        teamSuggestStart: values.teamSuggestStart
          ? values.teamSuggestStart.format("YYYY-MM-DD")
          : null,
        topicSelfSelectStart: values.topicSelfSelectStart
          ? values.topicSelfSelectStart.format("YYYY-MM-DD")
          : null,
        topicSelfSelectEnd: values.topicSelfSelectEnd
          ? values.topicSelfSelectEnd.format("YYYY-MM-DD")
          : null,
        topicSuggestStart: values.topicSuggestStart
          ? values.topicSuggestStart.format("YYYY-MM-DD")
          : null,
        desiredGroupSizeMin: values.desiredGroupSizeMin,
        desiredGroupSizeMax: values.desiredGroupSizeMax,
      };

      await SemesterService.updatePolicy(selectedSemester.semesterId, payload);

      notification.success({
        message: t("success") || "Success",
        description: t("policyUpdated") || "Policy updated successfully",
      });
      setIsPolicyModalOpen(false);
      policyForm.resetFields();
      fetchSemesters();
    } catch {
      notification.error({
        message: t("error") || "Error",
        description: t("failedToUpdatePolicy") || "Failed to update policy",
      });
    } finally {
      setSavingPolicy(false);
    }
  };

  const columns = [
    {
      title: t("season") || "Season",
      dataIndex: "season",
      key: "season",
      render: (season) => (
        <span className="font-medium text-gray-800">{season}</span>
      ),
    },
    {
      title: t("year") || "Year",
      dataIndex: "year",
      key: "year",
      render: (year) => <Tag color="blue">{year}</Tag>,
    },
    {
      title: t("startDate") || "Start Date",
      dataIndex: "startDate",
      key: "startDate",
      render: (date) => (
        <span className="text-gray-500">
          {date ? dayjs(date).format("DD/MM/YYYY") : "-"}
        </span>
      ),
    },
    {
      title: t("endDate") || "End Date",
      dataIndex: "endDate",
      key: "endDate",
      render: (date) => (
        <span className="text-gray-500">
          {date ? dayjs(date).format("DD/MM/YYYY") : "-"}
        </span>
      ),
    },
    {
      title: t("status") || "Status",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive) => {
        const label = isActive
          ? t("active") || "Active"
          : t("inactive") || "Inactive";
        const color = isActive ? "green" : "red";
        return (
          <Tag color={color} className="px-3 py-0.5 rounded-full text-xs">
            {label}
          </Tag>
        );
      },
    },
    {
      title: t("actions") || "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Tooltip title={t("viewDetails") || "View Details"}>
            <Button
              icon={<EyeOutlined />}
              shape="circle"
              onClick={() => handleView(record)}
            />
          </Tooltip>
          <Tooltip title={t("edit") || "Edit"}>
            <Button
              icon={<EditOutlined />}
              shape="circle"
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title={t("managePolicy") || "Manage Policy"}>
            <Button
              icon={<SettingOutlined />}
              shape="circle"
              onClick={() => handleManagePolicy(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const filteredSemesters = semesters.filter((semester) => {
    const statusMatch =
      filters.status === "All Status" ||
      (filters.status === "Active" && semester.isActive) ||
      (filters.status === "Inactive" && !semester.isActive);
    const seasonMatch =
      filters.season === "All Seasons" || semester.season === filters.season;
    const searchText = filters.search.toLowerCase();
    const searchMatch =
      semester.season?.toLowerCase().includes(searchText) ||
      semester.year?.toString().includes(searchText);

    return statusMatch && seasonMatch && searchMatch;
  });

  const disableStartDate = (current) => {
    if (!current) return false;
    const year = form.getFieldValue("year");
    if (year && current.year() !== year) return true;
    return current.isBefore(dayjs(), "day");
  };

  const disableEndDate = (current) => {
    if (!current) return false;
    const year = form.getFieldValue("year");
    if (year && current.year() !== year) return true;

    const startDate = form.getFieldValue("startDate");
    if (startDate) return current.isBefore(startDate, "day");
    return current.isBefore(dayjs(), "day");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="inline-block text-2xl sm:text-3xl lg:text-4xl font-extrabold">
            {t("semesterManagement") || "Semester Management"}
          </h1>
        </div>
        <Space className="flex-wrap">
          <Button
            icon={<PlusOutlined />}
            onClick={handleCreate}
            className="!bg-[#FF7A00] !text-white !border-none !rounded-md !px-6 !py-5 hover:!opacity-90"
          >
            <span className="hidden sm:inline">
              {t("createSemester") || "Create Semester"}
            </span>
          </Button>
        </Space>
      </div>

      <div className="flex flex-col gap-6">
        <Card
          className="shadow-sm border-gray-100"
          styles={{ body: { padding: "20px 24px" } }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              prefix={<SearchOutlined className="text-gray-400" />}
              placeholder="Search by season or year..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
            />
            <Select
              value={filters.status}
              onChange={(v) => setFilters({ ...filters, status: v })}
              className="w-full"
            >
              <Option value="All Status">
                {t("allStatus") || "All Status"}
              </Option>
              <Option value="Active">{t("active") || "Active"}</Option>
              <Option value="Inactive">{t("inactive") || "Inactive"}</Option>
            </Select>
            <Select
              value={filters.season}
              onChange={(v) => setFilters({ ...filters, season: v })}
              className="w-full"
            >
              <Option value="All Seasons">
                {t("allSeasons") || "All Seasons"}
              </Option>
              <Option value="Fall">Fall</Option>
              <Option value="Spring">Spring</Option>
              <Option value="Summer">Summer</Option>
            </Select>
          </div>

          <Table
            columns={columns}
            dataSource={filteredSemesters}
            rowKey="semesterId"
            loading={loading}
            pagination={{ pageSize: 5 }}
            bordered
            scroll={{ x: "max-content" }}
            className="rounded-lg mt-5"
          />
        </Card>
      </div>

      <SemesterFormModal
        open={isModalOpen}
        mode={modalMode}
        form={form}
        onSubmit={handleSubmit}
        okLoading={savingSemester}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        disableStartDate={disableStartDate}
        disableEndDate={disableEndDate}
        existingSemesters={semesters}
        currentSemesterId={selectedSemester?.semesterId}
      />

      <SemesterPolicyModal
        open={isPolicyModalOpen}
        form={policyForm}
        onSubmit={handlePolicySubmit}
        okLoading={savingPolicy}
        onCancel={() => {
          setIsPolicyModalOpen(false);
          policyForm.resetFields();
        }}
      />

      <SemesterDetailModal
        open={isDetailModalOpen}
        semester={selectedSemester}
        loading={detailLoading}
        onClose={handleCloseDetail}
      />
    </div>
  );
};

export default ManageSemesters;
