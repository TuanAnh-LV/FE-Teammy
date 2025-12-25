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

const ManageSkills = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [skillList, setSkillList] = useState([]);
  const [majorList, setMajorList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [templateLoading, setTemplateLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    major: "",
    role: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);

  const fetchMajors = async () => {
    try {
      const res = await AdminService.getMajors();
      const payload = res?.data ?? res;
      const list = Array.isArray(payload) ? payload : payload?.data ?? [];
      const software = list.find(
        (m) =>
          String(m.majorName ?? m.name ?? "")
            .toLowerCase()
            .trim() === "software engineering"
      );
      if (software) {
        const rest = list.filter((m) => m !== software);
        setMajorList([software, ...rest]);
      } else {
        setMajorList(list);
      }
      return list;
    } catch {
      notification.error({
        message: t("failedLoadMajors") || "Failed to load majors",
      });
    }
    return [];
  };

  const fetchSkills = async (params) => {
    setLoading(true);
    try {
      const res = await AdminService.getSkills(params);
      const payload = res?.data ?? res;
      setSkillList(Array.isArray(payload) ? payload : payload?.data ?? []);
    } catch {
      notification.error({
        message: t("failedLoadSkills") || "Failed to load skills",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchMajors();
      await fetchSkills();
    };
    init();
  }, []);

  const dataSource = useMemo(
    () =>
      (skillList || []).map((s, idx) => ({
        key: s.token ?? idx,
        token: s.token ?? "",
        role: s.role ?? "",
        major: s.major ?? "",
        aliases: Array.isArray(s.aliases) ? s.aliases : [],
        raw: s,
      })),
    [skillList]
  );

  const roleOptions = useMemo(() => {
    const roles = new Set();
    dataSource.forEach((s) => {
      if (s.role) roles.add(s.role);
    });
    return Array.from(roles).sort((a, b) => String(a).localeCompare(String(b)));
  }, [dataSource]);

  const filteredSkills = useMemo(() => {
    const searchText = filters.search.trim().toLowerCase();
    return dataSource.filter((s) => {
      const matchesMajor = !filters.major || s.major === filters.major;
      const matchesRole = !filters.role || s.role === filters.role;
      const matchesSearch = !searchText
        ? true
        : s.token.toLowerCase().includes(searchText);
      return matchesMajor && matchesRole && matchesSearch;
    });
  }, [dataSource, filters.major, filters.role, filters.search]);

  const openAddModal = () => {
    setEditingSkill(null);
    form.resetFields();
    form.setFieldsValue({
      major: filters.major || undefined,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (skill) => {
    setEditingSkill(skill);
    form.setFieldsValue({
      token: skill.token,
      role: skill.role,
      major: skill.major,
      aliases: skill.aliases,
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      if (editingSkill) {
        const res = await AdminService.updateSkill(editingSkill.token, {
          role: values.role,
          major: values.major,
          aliases: values.aliases || [],
        });
        const payload = res?.data ?? res;
        const updated = (Array.isArray(payload) ? payload[0] : payload) || {
          ...editingSkill,
          role: values.role,
          major: values.major,
          aliases: values.aliases || [],
        };
        notification.success({
          message: t("updated") || "Updated successfully",
        });
        setSkillList((prev) =>
          prev.map((s) => (s.token === editingSkill.token ? updated : s))
        );
      } else {
        const res = await AdminService.createSkill({
          token: values.token,
          role: values.role,
          major: values.major,
          aliases: values.aliases || [],
        });
        const payload = res?.data ?? res;
        const created = (Array.isArray(payload) ? payload[0] : payload) || {
          token: values.token,
          role: values.role,
          major: values.major,
          aliases: values.aliases || [],
        };
        notification.success({
          message: t("created") || "Created successfully",
        });
        setSkillList((prev) => [created, ...prev]);
      }
      setIsModalOpen(false);
    } catch (error) {
      if (!error?.errorFields) {
        notification.error({
          message: t("saveFailedSkill") || "Failed to save skill",
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (skill) => {
    Modal.confirm({
      title:
        t("confirmDelete")?.replace("{name}", skill.token) ||
        `Delete ${skill.token}?`,
      content:
        t("confirmDeleteContent") ||
        "This action cannot be undone. Do you want to continue?",
      centered: true,
      okText: t("delete") || "Delete",
      cancelText: t("cancel") || "Cancel",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await AdminService.deleteSkill(skill.token);
          notification.success({
            message: t("deleted") || "Deleted successfully",
          });
          await fetchSkills({
            major: filters.major || undefined,
            role: filters.role || undefined,
          });
        } catch {
          notification.error({
            message: t("deleteFailed") || "Failed to delete skill",
          });
        }
      },
    });
  };

  const handleDownloadTemplate = async () => {
    setTemplateLoading(true);
    try {
      const res = await AdminService.downloadSkillsTemplate(true);
      const data = res?.data ?? res;
      const disposition = res?.headers?.["content-disposition"];
      downloadBlob(data, "TeammySkillsTemplate.xlsx", disposition);
    } catch {
      notification.error({
        message: t("downloadFailed") || "Failed to download template",
      });
    } finally {
      setTemplateLoading(false);
    }
  };

  const getSkillId = (skill, fallback) => skill?.token ?? fallback;

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
        const res = await AdminService.importSkills(file);
        const payload = res?.data ?? res;
        const importMessage = getImportMessage(payload);
        const hasModal = showImportResultModal(payload);
        const prevIds = new Set(
          (skillList || []).map((s, idx) => String(getSkillId(s, idx)))
        );
        notification.success({
          message:
            hasModal || !importMessage
              ? t("importSuccess") || "Imported successfully"
              : importMessage,
        });
        await fetchSkills({
          major: filters.major || undefined,
          role: filters.role || undefined,
        });
        setSkillList((current) => {
          if (!Array.isArray(current) || !prevIds.size) return current;
          const added = [];
          const existing = [];
          current.forEach((s, idx) => {
            const id = String(getSkillId(s, idx));
            if (prevIds.has(id)) {
              existing.push(s);
            } else {
              added.push(s);
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
              ? t("importFailed") || "Failed to import skills"
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
      title: t("skillToken") || "Token",
      dataIndex: "token",
      key: "token",
      render: (text) => (
        <span className="font-medium text-gray-800">{text}</span>
      ),
    },
    {
      title: t("role") || "Role",
      dataIndex: "role",
      key: "role",
      render: (text) => <span className="text-gray-500">{text}</span>,
    },
    {
      title: t("major") || "Major",
      dataIndex: "major",
      key: "major",
      render: (text) => <span className="text-gray-500">{text}</span>,
    },
    {
      title: t("aliases") || "Aliases",
      dataIndex: "aliases",
      key: "aliases",
      render: (aliases) => (Array.isArray(aliases) ? aliases.join(", ") : ""),
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
            {t("managementSkills") || "Manage Skills"}
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
                {t("importSkills") || "Import Skills"}
              </span>
            </Button>
          </Upload>
          <Button
            icon={<PlusOutlined />}
            onClick={openAddModal}
            className="!bg-[#FF7A00] !text-white !border-none !rounded-md !px-6 !py-5 hover:!opacity-90"
          >
            <span className="hidden sm:inline">
              {t("addNewSkill") || "Add Skill"}
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
              placeholder={t("searchSkills") || "Search skills..."}
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
            />
            <Select
              value={filters.role}
              onChange={(v) => {
                setFilters((prev) => ({ ...prev, role: v }));
                fetchSkills({
                  major: filters.major || undefined,
                  role: v || undefined,
                });
              }}
              className="w-full"
              placeholder={t("role") || "Role"}
            >
              <Option value="">{t("allRoles") || "All Roles"}</Option>
              {roleOptions.map((role) => (
                <Option key={role} value={role}>
                  {role}
                </Option>
              ))}
            </Select>
            <Select
              value={filters.major}
              onChange={(v) => {
                setFilters((prev) => ({ ...prev, major: v }));
                fetchSkills({
                  major: v || undefined,
                  role: filters.role || undefined,
                });
              }}
              className="w-full"
            >
              <Option value="">{t("allMajor") || "All Major"}</Option>
              {majorList.map((m) => (
                <Option key={m.majorId ?? m.id} value={m.majorName ?? m.name}>
                  {m.majorName ?? m.name}
                </Option>
              ))}
            </Select>
          </div>

          <Table
            columns={columns}
            dataSource={filteredSkills}
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
          editingSkill
            ? t("editSkill") || "Edit Skill"
            : t("addNewSkill") || "Add Skill"
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
          {!editingSkill && (
            <Form.Item
              label={t("skillToken") || "Token"}
              name="token"
              rules={[
                { required: true, message: t("required") || "Required" },
                {
                  validator: (_, value) => {
                    if (!value) return Promise.resolve();
                    const next = String(value).trim().toLowerCase();
                    const exists = dataSource.some(
                      (s) => String(s.token).trim().toLowerCase() === next
                    );
                    return exists
                      ? Promise.reject(
                          new Error(t("tokenExists") || "Token already exists")
                        )
                      : Promise.resolve();
                  },
                },
              ]}
            >
              <Input placeholder={t("enterSkillToken") || "Enter token"} />
            </Form.Item>
          )}
          <Form.Item
            label={t("role") || "Role"}
            name="role"
            rules={[{ required: true, message: t("required") || "Required" }]}
          >
            <Input placeholder={t("enterRole") || "Enter role"} />
          </Form.Item>
          <Form.Item
            label={t("major") || "Major"}
            name="major"
            rules={[{ required: true, message: t("required") || "Required" }]}
          >
            <Select placeholder={t("selectMajor") || "Select major"}>
              {majorList.map((m) => (
                <Option key={m.majorId ?? m.id} value={m.majorName ?? m.name}>
                  {m.majorName ?? m.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label={t("aliases") || "Aliases"} name="aliases">
            <Select mode="tags" placeholder={t("enterAliases") || "Aliases"}>
              {(form.getFieldValue("aliases") || []).map((alias) => (
                <Option key={alias} value={alias}>
                  {alias}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ManageSkills;
