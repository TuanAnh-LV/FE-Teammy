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
        const responseData = error?.response?.data;
        const apiMessage =
          (typeof responseData === "string" ? responseData : null) ||
          responseData?.message ||
          responseData?.error ||
          error?.message ||
          "";
        if (apiMessage) {
          form.setFields([
            {
              name: "name",
              errors: [apiMessage],
            },
          ]);
        } else {
          notification.error({
            message: t("saveFailed") || "Failed to save major",
          });
        }
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

  const getMajorId = (major, fallback) =>
    major?.majorId ?? major?.id ?? fallback;

  const getImportMessage = (payload) => {
    if (!payload || typeof payload !== "object") return "";

    if (typeof payload.message === "string" && payload.message.trim()) {
      return payload.message.trim();
    }

    const skippedReasons = Array.isArray(payload.skippedReasons)
      ? payload.skippedReasons
      : [];
    if (!skippedReasons.length) return "";

    return skippedReasons
      .map((item) => item?.message ?? item?.reason ?? "")
      .filter((text) => typeof text === "string" && text.trim())
      .join("\n");
  };

  const showImportResultModal = (payload) => {
    const skippedReasons = Array.isArray(payload?.skippedReasons)
      ? payload.skippedReasons
      : [];
    if (!skippedReasons.length) return;

    const total = Number(payload?.total) || 0;
    const created = Number(payload?.created) || 0;
    const updated = Number(payload?.updated) || 0;
    const skipped = Number(payload?.skipped) || 0;
    const errorsCount = Array.isArray(payload?.errors)
      ? payload.errors.length
      : Number(payload?.errors) || 0;

    Modal.info({
      title: t("importResult") || "Import result",
      centered: true,
      content: (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
            <div>{`Total: ${total}`}</div>
            <div>{`Created: ${created}`}</div>
            <div>{`Updated: ${updated}`}</div>
            <div>{`Skipped: ${skipped}`}</div>
            <div>{`Errors: ${errorsCount}`}</div>
          </div>
          <div className="border-t border-gray-200 pt-2 text-sm font-semibold text-gray-700">
            {t("skippedReasons") || "Skipped reasons"}
          </div>
          <div className="max-h-64 overflow-y-auto pr-2">
            {skippedReasons.map((item, index) => {
              const row = item?.row ?? "-";
              const message = item?.message ?? item?.reason ?? "";
              const text = message ? `Row ${row}: ${message}` : `Row ${row}`;
              return (
                <div key={`${row}-${index}`} className="text-gray-700">
                  {text}
                </div>
              );
            })}
          </div>
        </div>
      ),
    });
    return true;
  };

  const uploadProps = {
    showUploadList: false,
    customRequest: async ({ file, onSuccess, onError }) => {
      setImporting(true);
      try {
        const res = await AdminService.importMajors(file);
        const payload = res?.data ?? res;
        const importMessage = getImportMessage(payload);
        const hasModal = showImportResultModal(payload);
        const prevIds = new Set(
          (majorList || []).map((m, idx) => String(getMajorId(m, idx)))
        );
        notification.success({
          message:
            hasModal || !importMessage
              ? t("importSuccess") || "Imported successfully"
              : importMessage,
        });
        await fetchMajors();
        setMajorList((current) => {
          if (!Array.isArray(current) || !prevIds.size) return current;
          const added = [];
          const existing = [];
          current.forEach((m, idx) => {
            const id = String(getMajorId(m, idx));
            if (prevIds.has(id)) {
              existing.push(m);
            } else {
              added.push(m);
            }
          });
          return added.length ? [...added, ...existing] : current;
        });
        onSuccess?.(null, file);
      } catch (error) {
        const payload = error?.response?.data ?? error?.data ?? error;
        const importMessage = getImportMessage(payload);
        const hasModal = showImportResultModal(payload);
        notification.error({
          message:
            hasModal || !importMessage
              ? t("importFailed") || "Failed to import majors"
              : importMessage,
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
