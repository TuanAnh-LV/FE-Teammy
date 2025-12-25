import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Form,
  Input,
  Modal,
  notification,
  Select,
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

const { Option } = Select;

const ManagePositions = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [positionList, setPositionList] = useState([]);
  const [majorList, setMajorList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [templateLoading, setTemplateLoading] = useState(false);
  const [filters, setFilters] = useState({ search: "", majorId: "" });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState(null);

  const fetchMajors = async () => {
    try {
      const res = await AdminService.getMajors();
      const payload = res?.data ?? res;
      const list = Array.isArray(payload) ? payload : payload?.data ?? [];
      const normalized = list || [];
      const software = normalized.find(
        (m) =>
          String(m.majorName ?? m.name ?? "")
            .toLowerCase()
            .trim() === "software engineering"
      );
      if (software) {
        const rest = normalized.filter((m) => m !== software);
        setMajorList([software, ...rest]);
      } else {
        setMajorList(normalized);
      }
      return normalized;
    } catch {
      notification.error({
        message: t("failedLoadMajors") || "Failed to load majors",
      });
    }
    return [];
  };

  const fetchPositions = async (majorId) => {
    setLoading(true);
    try {
      const params = majorId ? { majorId } : undefined;
      const res = await AdminService.getPositions(params);
      const payload = res?.data ?? res;
      setPositionList(Array.isArray(payload) ? payload : payload?.data ?? []);
    } catch {
      notification.error({
        message: t("failedLoadPositions") || "Failed to load positions",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      const majors = await fetchMajors();
      const software = (majors || []).find(
        (m) =>
          String(m.majorName ?? m.name ?? "")
            .toLowerCase()
            .trim() === "software engineering"
      );
      const defaultMajorId = software?.majorId ?? software?.id ?? "";
      setFilters((prev) => ({ ...prev, majorId: defaultMajorId }));
      await fetchPositions(defaultMajorId);
    };
    init();
  }, []);

  const majorNameById = useMemo(() => {
    const map = new Map();
    (majorList || []).forEach((m) => {
      const id = m.majorId ?? m.id;
      if (id != null) {
        map.set(String(id), m.majorName ?? m.name ?? "");
      }
    });
    return map;
  }, [majorList]);

  const dataSource = useMemo(
    () =>
      (positionList || []).map((p, idx) => {
        const majorId = p.majorId ?? p.major?.majorId ?? null;
        const majorName =
          p.majorName ??
          p.major?.majorName ??
          (majorId != null ? majorNameById.get(String(majorId)) : "") ??
          "";
        return {
          key: p.positionId ?? p.id ?? idx,
          positionId: p.positionId ?? p.id,
          positionName: p.positionName ?? p.name ?? "",
          majorId,
          majorName,
          raw: p,
        };
      }),
    [positionList, majorNameById]
  );

  const filteredPositions = useMemo(() => {
    const searchText = filters.search.trim().toLowerCase();
    return dataSource.filter((p) => {
      const matchesMajor =
        !filters.majorId ||
        String(p.majorId) === String(filters.majorId);
      const matchesSearch = !searchText
        ? true
        : String(p.positionName).toLowerCase().includes(searchText);
      return matchesMajor && matchesSearch;
    });
  }, [dataSource, filters.majorId, filters.search]);

  const openAddModal = () => {
    setEditingPosition(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const openEditModal = (position) => {
    setEditingPosition(position);
    form.setFieldsValue({
      name: position.positionName || "",
      majorId: position.majorId ?? undefined,
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      if (editingPosition) {
        const res = await AdminService.updatePosition(
          editingPosition.positionId,
          {
            positionName: values.name,
            majorId: values.majorId,
          }
        );
        const payload = res?.data ?? res;
        const updated = (Array.isArray(payload) ? payload[0] : payload) || {
          ...editingPosition,
          positionName: values.name,
          majorId: values.majorId,
        };
        notification.success({
          message: t("updated") || "Updated successfully",
        });
        setPositionList((prev) =>
          prev.map((p) =>
            (p.positionId ?? p.id) ===
            (editingPosition.positionId ?? editingPosition.id)
              ? {
                  ...p,
                  ...updated,
                  positionName: updated.positionName ?? updated.name,
                  majorId: updated.majorId ?? p.majorId,
                }
              : p
          )
        );
      } else {
        const res = await AdminService.createPosition({
          positionName: values.name,
          majorId: values.majorId,
        });
        const payload = res?.data ?? res;
        const createdRaw = Array.isArray(payload) ? payload[0] : payload;
        const created = createdRaw || {
          positionId: Date.now(),
          positionName: values.name,
          majorId: values.majorId,
        };
        const normalizedCreated = {
          ...created,
          positionName: created.positionName ?? created.name ?? values.name,
          majorId: created.majorId ?? values.majorId,
        };
        notification.success({
          message: t("created") || "Created successfully",
        });
        setPositionList((prev) => [normalizedCreated, ...prev]);
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
            message: t("saveFailed") || "Failed to save position",
          });
        }
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (position) => {
    Modal.confirm({
      title:
        t("confirmDelete")?.replace("{name}", position.positionName) ||
        `Delete ${position.positionName}?`,
      content:
        t("confirmDeleteContent") ||
        "This action cannot be undone. Do you want to continue?",
      centered: true,
      okText: t("delete") || "Delete",
      cancelText: t("cancel") || "Cancel",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await AdminService.deletePosition(position.positionId);
          notification.success({
            message: t("deleted") || "Deleted successfully",
          });
          await fetchPositions(filters.majorId);
        } catch {
          notification.error({
            message: t("deleteFailed") || "Failed to delete position",
          });
        }
      },
    });
  };

  const handleDownloadTemplate = async () => {
    setTemplateLoading(true);
    try {
      const res = await AdminService.downloadPositionsTemplate(true);
      const data = res?.data ?? res;
      const disposition = res?.headers?.["content-disposition"];
      downloadBlob(data, "TeammyPositionsTemplate.xlsx", disposition);
    } catch {
      notification.error({
        message: t("downloadFailed") || "Failed to download template",
      });
    } finally {
      setTemplateLoading(false);
    }
  };

  const getPositionId = (position, fallback) =>
    position?.positionId ?? position?.id ?? fallback;

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
    if (!skippedReasons.length) return false;

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
        const res = await AdminService.importPositions(file);
        const payload = res?.data ?? res;
        const importMessage = getImportMessage(payload);
        const hasModal = showImportResultModal(payload);
        const prevIds = new Set(
          (positionList || []).map((p, idx) =>
            String(getPositionId(p, idx))
          )
        );
        notification.success({
          message:
            hasModal || !importMessage
              ? t("importSuccess") || "Imported successfully"
              : importMessage,
        });
        await fetchPositions(filters.majorId);
        setPositionList((current) => {
          if (!Array.isArray(current) || !prevIds.size) return current;
          const added = [];
          const existing = [];
          current.forEach((p, idx) => {
            const id = String(getPositionId(p, idx));
            if (prevIds.has(id)) {
              existing.push(p);
            } else {
              added.push(p);
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
              ? t("importFailed") || "Failed to import positions"
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
      title: t("positionName") || "Position",
      dataIndex: "positionName",
      key: "positionName",
      render: (text) => (
        <span className="font-medium text-gray-800">{text}</span>
      ),
    },
    {
      title: t("major") || "Major",
      dataIndex: "majorName",
      key: "majorName",
      render: (text) => <span className="text-gray-500">{text}</span>,
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
            {t("managementPositions") || "Manage Positions"}
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
                {t("importPositions") || "Import Positions"}
              </span>
            </Button>
          </Upload>
          <Button
            icon={<PlusOutlined />}
            onClick={openAddModal}
            className="!bg-[#FF7A00] !text-white !border-none !rounded-md !px-6 !py-5 hover:!opacity-90"
          >
            <span className="hidden sm:inline">
              {t("addPosition") || "Add Position"}
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
              placeholder={t("searchPositions") || "Search positions..."}
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
            />
            <Select
              value={filters.majorId}
              onChange={(v) => {
                setFilters((prev) => ({ ...prev, majorId: v }));
                fetchPositions(v);
              }}
              className="w-full"
            >
              {majorList.map((m) => (
                <Option key={m.majorId ?? m.id} value={m.majorId ?? m.id}>
                  {m.majorName ?? m.name}
                </Option>
              ))}
            </Select>
          </div>

          <Table
            columns={columns}
            dataSource={filteredPositions}
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
          editingPosition
            ? t("editPosition") || "Edit Position"
            : t("addPosition") || "Add Position"
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
            label={t("major") || "Major"}
            name="majorId"
            rules={[{ required: true, message: t("required") || "Required" }]}
          >
            <Select placeholder={t("selectMajor") || "Select major"}>
              {majorList.map((m) => (
                <Option key={m.majorId ?? m.id} value={m.majorId ?? m.id}>
                  {m.majorName ?? m.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label={t("positionName") || "Position Name"}
            name="name"
            rules={[
              {
                required: true,
                message: t("required") || "Required",
              },
            ]}
          >
            <Input placeholder={t("enterPosition") || "Enter position name"} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ManagePositions;
