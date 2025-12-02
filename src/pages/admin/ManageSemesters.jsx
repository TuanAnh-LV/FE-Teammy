import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Space,
  Card,
  Modal,
  notification,
  Tag,
  Form,
  Input,
  DatePicker,
  Switch,
  InputNumber,
  Select,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  SettingOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { SemesterService } from "../../services/semester.service";
import { useTranslation } from "../../hook/useTranslation";
import dayjs from "dayjs";

const { Option } = Select;

const ManageSemesters = () => {
  const { t } = useTranslation();
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [modalMode, setModalMode] = useState("create"); // create | edit | view
  const [form] = Form.useForm();
  const [policyForm] = Form.useForm();
  const [filters, setFilters] = useState({
    search: "",
    status: "All Status",
    season: "All Seasons",
  });

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
    } catch (error) {

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

  const handleView = (record) => {
    setModalMode("view");
    setSelectedSemester(record);
    form.setFieldsValue({
      season: record.season,
      year: record.year,
      startDate: record.startDate ? dayjs(record.startDate) : null,
      endDate: record.endDate ? dayjs(record.endDate) : null,
    });
    setIsModalOpen(true);
  };

  const handleActivate = async (record) => {
    Modal.confirm({
      title: t("activateSemester") || "Activate Semester",
      content: `${
        t("confirmActivate") || "Are you sure you want to activate"
      } ${record.season} ${record.year}?`,
      centered: true,
      okText: t("confirm") || "Confirm",
      cancelText: t("cancel") || "Cancel",
      okButtonProps: {
        className:
          "!bg-[#FF7A00] !text-white !border-none !rounded-md !px-4 !py-2 hover:!opacity-90",
      },
      cancelButtonProps: {
        className:
          "!border-gray-300 hover:!border-orange-400 hover:!text-orange-400 transition-all !py-2",
      },
      onOk: async () => {
        try {
          await SemesterService.activate(record.semesterId);
          notification.success({
            message:
              t("semesterActivated") || "Semester activated successfully",
          });
          fetchSemesters();
        } catch (error) {

          notification.error({
            message: t("failedToActivate") || "Failed to activate semester",
          });
        }
      },
    });
  };

  const handleManagePolicy = async (record) => {
    setSelectedSemester(record);
    try {
      const response = await SemesterService.getPolicy(record.semesterId);
      const policy = response?.data || {};
      policyForm.setFieldsValue({
        minGroupSize: policy.minGroupSize || 3,
        maxGroupSize: policy.maxGroupSize || 6,
        allowLateSubmission: policy.allowLateSubmission || false,
        lateSubmissionPenalty: policy.lateSubmissionPenalty || 10,
        requireMentorApproval: policy.requireMentorApproval || true,
        allowTopicChange: policy.allowTopicChange || false,
        topicChangeDeadline: policy.topicChangeDeadline
          ? dayjs(policy.topicChangeDeadline)
          : null,
      });
      setIsPolicyModalOpen(true);
    } catch (error) {

      notification.error({
        message: t("error") || "Error",
        description: t("failedToFetchPolicy") || "Failed to fetch policy",
      });
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
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
    } catch (error) {

      notification.error({
        message: t("error") || "Error",
        description: t("failedToSaveSemester") || "Failed to save semester",
      });
    }
  };

  const handlePolicySubmit = async () => {
    try {
      const values = await policyForm.validateFields();
      const payload = {
        minGroupSize: values.minGroupSize,
        maxGroupSize: values.maxGroupSize,
        allowLateSubmission: values.allowLateSubmission,
        lateSubmissionPenalty: values.lateSubmissionPenalty,
        requireMentorApproval: values.requireMentorApproval,
        allowTopicChange: values.allowTopicChange,
        topicChangeDeadline: values.topicChangeDeadline
          ? values.topicChangeDeadline.format("YYYY-MM-DD")
          : null,
      };

      await SemesterService.updatePolicy(selectedSemester.semesterId, payload);
      notification.success({
        message: t("success") || "Success",
        description: t("policyUpdated") || "Policy updated successfully",
      });
      setIsPolicyModalOpen(false);
      policyForm.resetFields();
    } catch (error) {

      notification.error({
        message: t("error") || "Error",
        description: t("failedToUpdatePolicy") || "Failed to update policy",
      });
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
          <Button
            icon={<EyeOutlined />}
            shape="circle"
            onClick={() => handleView(record)}
          />
          <Button
            icon={<EditOutlined />}
            shape="circle"
            onClick={() => handleEdit(record)}
          />
          <Button
            icon={<SettingOutlined />}
            shape="circle"
            onClick={() => handleManagePolicy(record)}
          />
          {!record.isActive && (
            <Button
              icon={<CheckCircleOutlined />}
              shape="circle"
              style={{ color: "#52c41a", borderColor: "#52c41a" }}
              onClick={() => handleActivate(record)}
              title={t("activate") || "Activate"}
            />
          )}
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

  return (
    <div className="space-y-4">
      {/* Header */}
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
        {/* Filters & Table */}
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
              <Option value="All Seasons">All Seasons</Option>
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

      {/* Create/Edit/View Modal */}
      <Modal
        title={
          modalMode === "create"
            ? t("createSemester") || "Create Semester"
            : modalMode === "edit"
            ? t("editSemester") || "Edit Semester"
            : t("semesterDetails") || "Semester Details"
        }
        open={isModalOpen}
        onOk={modalMode === "view" ? () => setIsModalOpen(false) : handleSubmit}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        okText={
          modalMode === "view" ? t("close") || "Close" : t("save") || "Save"
        }
        cancelText={t("cancel") || "Cancel"}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          className="mt-4"
          disabled={modalMode === "view"}
        >
          <Form.Item
            label={t("season") || "Season"}
            name="season"
            rules={[
              {
                required: true,
                message: t("pleaseSelectSeason") || "Please select season",
              },
            ]}
          >
            <Input placeholder="Fall, Spring, Summer" />
          </Form.Item>

          <Form.Item
            label={t("year") || "Year"}
            name="year"
            rules={[
              {
                required: true,
                message: t("pleaseEnterYear") || "Please enter year",
              },
            ]}
          >
            <InputNumber min={2020} max={2100} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            label={t("startDate") || "Start Date"}
            name="startDate"
            rules={[
              {
                required: true,
                message:
                  t("pleaseSelectStartDate") || "Please select start date",
              },
            ]}
          >
            <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item
            label={t("endDate") || "End Date"}
            name="endDate"
            rules={[
              {
                required: true,
                message: t("pleaseSelectEndDate") || "Please select end date",
              },
            ]}
          >
            <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Policy Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <SettingOutlined />
            <span>{t("semesterPolicy") || "Semester Policy"}</span>
          </div>
        }
        open={isPolicyModalOpen}
        onOk={handlePolicySubmit}
        onCancel={() => {
          setIsPolicyModalOpen(false);
          policyForm.resetFields();
        }}
        okText={t("save") || "Save"}
        cancelText={t("cancel") || "Cancel"}
        width={700}
      >
        <Form form={policyForm} layout="vertical" className="mt-4">
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              label={t("minGroupSize") || "Min Group Size"}
              name="minGroupSize"
              rules={[{ required: true }]}
            >
              <InputNumber min={1} max={10} style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item
              label={t("maxGroupSize") || "Max Group Size"}
              name="maxGroupSize"
              rules={[{ required: true }]}
            >
              <InputNumber min={1} max={20} style={{ width: "100%" }} />
            </Form.Item>
          </div>

          <Form.Item
            label={t("allowLateSubmission") || "Allow Late Submission"}
            name="allowLateSubmission"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            label={t("lateSubmissionPenalty") || "Late Submission Penalty (%)"}
            name="lateSubmissionPenalty"
          >
            <InputNumber min={0} max={100} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            label={t("requireMentorApproval") || "Require Mentor Approval"}
            name="requireMentorApproval"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            label={t("allowTopicChange") || "Allow Topic Change"}
            name="allowTopicChange"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            label={t("topicChangeDeadline") || "Topic Change Deadline"}
            name="topicChangeDeadline"
          >
            <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ManageSemesters;

