import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Form,
  Input,
  Modal,
  notification,
  Space,
  Table,
  Tooltip,
  Upload,
} from "antd";
import {
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { AdminService } from "../../services/admin.service";
import { useTranslation } from "../../hook/useTranslation";
import { downloadBlob } from "../../utils/download";

const ManageMajors = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [majorList, setMajorList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [templateLoading, setTemplateLoading] = useState(false);
  const [filters, setFilters] = useState({ search: "" });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMajor, setEditingMajor] = useState(null);

  const fetchMajors = async () => {
    setLoading(true);
    try {
      const res = await AdminService.getMajors();
      const payload = res?.data ?? res;
      setMajorList(Array.isArray(payload) ? payload : payload?.data ?? []);
    } catch {
      notification.error({
        message: t("failedLoadMajors") || "Failed to load majors",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMajors();
  }, []);

  const dataSource = useMemo(
    () =>
      (majorList || []).map((m, idx) => ({
        key: m.majorId ?? m.id ?? idx,
        majorId: m.majorId ?? m.id,
        majorName: m.majorName ?? m.name ?? "",
        raw: m,
      })),
    [majorList]
  );

  const filteredMajors = useMemo(() => {
    const searchText = filters.search.trim().toLowerCase();
    if (!searchText) return dataSource;
    return dataSource.filter((m) =>
      String(m.majorName).toLowerCase().includes(searchText)
    );
  }, [dataSource, filters.search]);

  const openAddModal = () => {
    setEditingMajor(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const openEditModal = (major) => {
    setEditingMajor(major);
    form.setFieldsValue({ name: major.majorName || "" });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      if (editingMajor) {
        const res = await AdminService.updateMajor(editingMajor.majorId, {
          name: values.name,
        });
        const payload = res?.data ?? res;
        const updated = (Array.isArray(payload) ? payload[0] : payload) || {
          ...editingMajor,
          majorName: values.name,
        };
        notification.success({
          message: t("updated") || "Updated successfully",
        });
        setMajorList((prev) =>
          prev.map((m) =>
            (m.majorId ?? m.id) === (editingMajor.majorId ?? editingMajor.id)
              ? {
                  ...m,
                  ...updated,
                  majorName: updated.majorName ?? updated.name,
                }
              : m
          )
        );
      } else {
        const res = await AdminService.createMajor({ name: values.name });
        const payload = res?.data ?? res;
        const createdRaw = Array.isArray(payload) ? payload[0] : payload;
        const created = createdRaw || {
          majorId: Date.now(),
          majorName: values.name,
        };
        const normalizedCreated = {
          ...created,
          majorName: created.majorName ?? created.name ?? values.name,
        };
        notification.success({
          message: t("created") || "Created successfully",
        });
        setMajorList((prev) => [normalizedCreated, ...prev]);
      }
      setIsModalOpen(false);
    } catch (error) {
      if (!error?.errorFields) {
        notification.error({
          message: t("saveFailed") || "Failed to save major",
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (major) => {
    Modal.confirm({
      title:
        t("confirmDelete")?.replace("{name}", major.majorName) ||
        `Delete ${major.majorName}?`,
      content:
        t("confirmDeleteContent") ||
        "This action cannot be undone. Do you want to continue?",
      centered: true,
      okText: t("delete") || "Delete",
      cancelText: t("cancel") || "Cancel",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await AdminService.deleteMajor(major.majorId);
          notification.success({
            message: t("deleted") || "Deleted successfully",
          });
          await fetchMajors();
        } catch {
          notification.error({
            message: t("deleteFailed") || "Failed to delete major",
          });
        }
      },
    });
  };

  const handleDownloadTemplate = async () => {
    setTemplateLoading(true);
    try {
      const res = await AdminService.downloadMajorsTemplate(true);
      const data = res?.data ?? res;
      const disposition = res?.headers?.["content-disposition"];
      downloadBlob(data, "TeammyMajorsTemplate.xlsx", disposition);
    } catch {
      notification.error({
        message: t("downloadFailed") || "Failed to download template",
      });
    } finally {
      setTemplateLoading(false);
    }
  };

  const uploadProps = {
    showUploadList: false,
    customRequest: async ({ file, onSuccess, onError }) => {
      setImporting(true);
      try {
        await AdminService.importMajors(file);
        notification.success({
          message: t("importSuccess") || "Imported successfully",
        });
        await fetchMajors();
        onSuccess?.(null, file);
      } catch (error) {
        notification.error({
          message: t("importFailed") || "Failed to import majors",
        });
        onError?.(error);
      } finally {
        setImporting(false);
      }
    },
  };

  const columns = [
    {
      title: t("major") || "Major",
      dataIndex: "majorName",
      key: "majorName",
      render: (text) => (
        <span className="font-medium text-gray-800">{text}</span>
      ),
    },
    {
      title: t("actions") || "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Tooltip title={t("edit") || "Edit"}>
            <Button
              icon={<EditOutlined />}
              shape="circle"
              onClick={() => openEditModal(record)}
            />
          </Tooltip>
          <Tooltip title={t("delete") || "Delete"}>
            <Button
              icon={<DeleteOutlined />}
              shape="circle"
              danger
              onClick={() => handleDelete(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="inline-block text-2xl sm:text-3xl lg:text-4xl font-extrabold">
            {t("managementMajors") || "Manage Majors"}
          </h1>
        </div>
        <Space className="flex-wrap">
          <Button
            icon={<DownloadOutlined />}
            onClick={handleDownloadTemplate}
            loading={templateLoading}
            className="!border-gray-300 hover:!border-orange-400 hover:!text-orange-400 transition-all !py-5"
          >
            <span className="hidden sm:inline">
              {t("downloadTemplate") || "Download Template"}
            </span>
          </Button>
          <Upload {...uploadProps}>
            <Button
              icon={<UploadOutlined />}
              loading={importing}
              className="!border-gray-300 hover:!border-orange-400 hover:!text-orange-400 transition-all !py-5"
            >
              <span className="hidden sm:inline">
                {t("importMajors") || "Import Majors"}
              </span>
            </Button>
          </Upload>
          <Button
            icon={<PlusOutlined />}
            onClick={openAddModal}
            className="!bg-[#FF7A00] !text-white !border-none !rounded-md !px-6 !py-5 hover:!opacity-90"
          >
            <span className="hidden sm:inline">
              {t("addMajor") || "Add Major"}
            </span>
          </Button>
        </Space>
      </div>

      <div className="flex flex-col gap-6">
        <Card
          className="shadow-sm border-gray-100"
          styles={{ body: { padding: "20px 24px" } }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Input
              prefix={<SearchOutlined className="text-gray-400" />}
              placeholder={t("searchMajors") || "Search majors..."}
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
            />
          </div>

          <Table
            columns={columns}
            dataSource={filteredMajors}
            loading={loading}
            pagination={{ pageSize: 8 }}
            bordered
            scroll={{ x: "max-content" }}
            className="rounded-lg mt-5"
          />
        </Card>
      </div>

      <Modal
        title={
          editingMajor
            ? t("editMajor") || "Edit Major"
            : t("addMajor") || "Add Major"
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSave}
        confirmLoading={saving}
        okText={t("save") || "Save"}
        cancelText={t("cancel") || "Cancel"}
        okButtonProps={{
          className: "!bg-[#FF7A00] hover:!opacity-90 !text-white !border-none",
        }}
        cancelButtonProps={{
          className:
            "!border-gray-300 hover:!border-orange-400 hover:!text-orange-400 transition-all",
        }}
        centered
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label={t("majorName") || "Major Name"}
            name="name"
            rules={[
              {
                required: true,
                message: t("required") || "Required",
              },
            ]}
          >
            <Input placeholder={t("enterMajor") || "Enter major name"} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ManageMajors;
