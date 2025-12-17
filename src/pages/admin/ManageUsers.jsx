import React, { useState, useEffect } from "react";
import {
  Table,
  Input,
  Select,
  Button,
  Tag,
  Space,
  Card,
  Modal,
  notification,
  Tooltip,
} from "antd";
import {
  UploadOutlined,
  PlusOutlined,
  SearchOutlined,
  EyeOutlined,
  EditOutlined,
  StopOutlined,
} from "@ant-design/icons";
import UserDetailModal from "../../components/admin/UserDetailModal";
import UserAddModal from "../../components/admin/UserAddModal";
import UserEditModal from "../../components/admin/UserEditModal";
import { AdminService } from "../../services/admin.service";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "../../hook/useTranslation";
import { MajorService } from "../../services/major.service";
const { Option } = Select;
const ManageUsers = () => {
  const [filters, setFilters] = useState({
    role: "All Roles",
    status: "All Status",
    major: "All Major",
    search: "",
  });

  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [userList, setUserList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [majorList, setMajorList] = useState([]);

  const handleView = async (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
    setDetailLoading(true);
    try {
      const id = user.raw?.userId || user.key;
      const res = await AdminService.detailUser(id);
      const payload = res?.data ?? res;
      const fullUser = Array.isArray(payload) ? payload[0] : payload;
      const enriched = {
        ...user,
        displayName: fullUser?.displayName || user.name,
        phone: fullUser?.phone || user.phone,
        major: fullUser?.majorName || user.major,
        studentCode: fullUser?.studentCode || user.studentCode,
        gender: fullUser?.gender || null,
        createdAt: fullUser?.createdAt || null,
        emailVerified: fullUser?.emailVerified || false,
        raw: fullUser,
      };
      setSelectedUser(enriched);
    } catch {
      notification.error({
        message: t("failedLoadUserDetails") || "Failed to load user details",
      });
    } finally {
      setDetailLoading(false);
    }
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setIsEditOpen(true);
  };

  const handleSaveEdit = (updatedUser) => {
    setUserList((prev) =>
      prev.map((u) => (u.key === updatedUser.key ? updatedUser : u))
    );
  };

  const handleAddUser = (newUser) => {
    setUserList((prev) => [newUser, ...prev]);
  };

  const handleBan = (user) => {
    Modal.confirm({
      title:
        t("confirmBanTitle").replace("{name}", user.displayName) ||
        `Ban ${user.displayName}?`,
      content:
        t("confirmBanContent").replace("{name}", user.displayName) ||
        `Are you sure you want to ban ${user.displayName}? This action can be undone later.`,
      centered: true,
      okText: t("confirmBanOk") || "Confirm Ban",
      cancelText: t("confirmBanCancel") || "Cancel",
      okButtonProps: {
        className:
          "!bg-red-500 !text-white !border-none !rounded-md !px-4 !py-2 hover:!opacity-90",
      },
      cancelButtonProps: {
        className:
          "!border-gray-300 hover:!border-orange-400 hover:!text-orange-400 transition-all !py-2",
      },
      onOk: async () => {
        const id = user.raw?.userId || user.key;
        try {
          await AdminService.banUser(id);
          setUserList((prev) =>
            prev.map((u) =>
              u.key === user.key ? { ...u, isActive: false } : u
            )
          );
          notification.success({
            message:
              (t("userBannedSuccess") &&
                t("userBannedSuccess").replace(
                  "{name}",
                  user.displayName || user.name
                )) ||
              `${user.displayName || user.name} has been banned.`,
          });
        } catch {
          notification.error({
            message:
              (t("userBanFailed") &&
                t("userBanFailed").replace(
                  "{name}",
                  user.displayName || user.name
                )) ||
              `Failed to ban ${user.displayName || user.name}`,
          });
        }
      },
    });
  };

  useEffect(() => {
    let mounted = true;
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await AdminService.getListUsers();
        const payload = res?.data ?? res;
        const list = Array.isArray(payload) ? payload : payload?.data ?? [];

        const mapped = (list || []).map((u, idx) => ({
          key: u.userId || u.id || idx,
          name: u.displayName || u.name || "",
          email: u.email || "",
          role:
            (u.role &&
              String(u.role).charAt(0).toUpperCase() +
                String(u.role).slice(1)) ||
            "",
          phone: u.phone || "",
          major: u.majorName || "",
          studentCode: u.studentCode || null,
          avatarUrl: u.avatarUrl || null,
          displayName: u.displayName || u.name || "",
          majorId: u.majorId || null,
          isActive: Boolean(u.isActive),
          status: u.isActive ? "Active" : "Suspended",
          raw: u,
        }));

        if (mounted) setUserList(mapped);
      } catch {
        notification.error({
          message: t("failedLoadUsers") || "Failed to load users",
        });
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchUsers();
    return () => {
      mounted = false;
    };
  }, []);
  useEffect(() => {
    const fetchMajors = async () => {
      try {
        const res = await MajorService.getMajors();
        const payload = res?.data ?? res;

        setMajorList(payload || []);
      } catch {
        notification.error({
          message: t("failedLoadMajors") || "Failed to load majors",
        });
      }
    };

    fetchMajors();
  }, []);

  const columns = [
    {
      title: t("name") || "Name",
      dataIndex: "name",
      key: "name",
      render: (text) => (
        <span className="font-medium text-gray-800">{text}</span>
      ),
    },
    {
      title: t("email") || "Email",
      dataIndex: "email",
      key: "email",
      render: (text) => <span className="text-gray-500">{text}</span>,
    },
    {
      title: t("role") || "Role",
      dataIndex: "role",
      key: "role",
      render: (role) => {
        const key = String(role).toLowerCase();
        const map = {
          admin: { color: "red", label: t("admin") || "Admin" },
          mentor: { color: "green", label: t("mentor") || "Mentor" },
          moderator: { color: "purple", label: t("moderator") || "Moderator" },
          student: { color: "blue", label: t("student") || "Student" },
        };
        const info = map[key] || { color: "default", label: role };
        return <Tag color={info.color}>{info.label}</Tag>;
      },
    },
    {
      title: t("major") || "Major",
      dataIndex: "major",
      key: "major",
    },
    {
      title: t("status") || "Status",
      dataIndex: "isActive",
      key: "status",
      render: (isActive) => {
        const label = isActive
          ? t("active") || "Active"
          : t("suspended") || "Suspended";
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
          <Tooltip title={t("banUser") || "Ban User"}>
            <Button
              icon={<StopOutlined />}
              shape="circle"
              danger
              onClick={() => handleBan(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const filteredUsers = userList.filter((user) => {
    const roleMatch =
      filters.role === "All Roles" || user.role === filters.role;
    const statusMatch =
      filters.status === "All Status" ||
      (filters.status === "Active" && user.isActive) ||
      (filters.status === "Suspended" && !user.isActive);
    const majorMatch =
      filters.major === "All Major" || user.major === filters.major;
    const searchText = filters.search.toLowerCase();
    const searchMatch =
      user.name.toLowerCase().includes(searchText) ||
      user.email.toLowerCase().includes(searchText);

    return roleMatch && statusMatch && majorMatch && searchMatch;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="inline-block text-2xl sm:text-3xl lg:text-4xl font-extrabold">
            {t("usersAndRoles") || "Mangage Users and Roles"}
          </h1>
        </div>
        <Space className="flex-wrap">
          <Button
            icon={<UploadOutlined />}
            onClick={() => navigate("/admin/import-users")}
            className="!border-gray-300 hover:!border-orange-400 hover:!text-orange-400 transition-all !py-5"
          >
            <span className="hidden sm:inline">
              {t("importUsers") || "Import Users"}
            </span>
          </Button>
          <Button
            icon={<PlusOutlined />}
            onClick={() => setIsAddOpen(true)}
            className="!bg-[#FF7A00] !text-white !border-none !rounded-md !px-6 !py-5 hover:!opacity-90"
          >
            <span className="hidden sm:inline">
              {t("addUser") || "Add User"}
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
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Input
              prefix={<SearchOutlined className="text-gray-400" />}
              placeholder="Search by name or email..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
            />
            <Select
              value={filters.role}
              onChange={(v) => setFilters({ ...filters, role: v })}
              className="w-full"
            >
              <Option value="All Roles">{t("allRoles") || "All Roles"}</Option>
              <Option value="Admin">{t("admin") || "Admin"}</Option>
              <Option value="Mentor">{t("mentor") || "Mentor"}</Option>
              <Option value="Moderator">{t("moderator") || "Moderator"}</Option>
              <Option value="Student">{t("student") || "Student"}</Option>
            </Select>
            <Select
              value={filters.status}
              onChange={(v) => setFilters({ ...filters, status: v })}
              className="w-full"
            >
              <Option value="All Status">
                {t("allStatus") || "All Status"}
              </Option>
              <Option value="Active">{t("active") || "Active"}</Option>
              <Option value="Suspended">{t("suspended") || "Suspended"}</Option>
            </Select>
            <Select
              value={filters.major}
              onChange={(v) => setFilters({ ...filters, major: v })}
              className="w-full"
            >
              <Option value="All Major">{t("allMajor") || "All Major"}</Option>

              {majorList.map((m) => (
                <Option key={m.majorId} value={m.majorName}>
                  {m.majorName}
                </Option>
              ))}
            </Select>
          </div>

          <Table
            columns={columns}
            dataSource={filteredUsers}
            loading={loading}
            pagination={{ pageSize: 5 }}
            bordered
            scroll={{ x: "max-content" }}
            className="rounded-lg mt-5"
          />
        </Card>
      </div>

      {/* Modals */}
      <UserDetailModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={selectedUser}
        loading={detailLoading}
      />
      <UserEditModal
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        user={selectedUser}
        onSave={handleSaveEdit}
        destroyOnClose
      />
      <UserAddModal
        open={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAdd={handleAddUser}
        majorList={majorList}
        destroyOnClose
      />
    </div>
  );
};

export default ManageUsers;
