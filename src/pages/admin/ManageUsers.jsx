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
} from "antd";
import {
  UploadOutlined,
  PlusOutlined,
  SearchOutlined,
  EyeOutlined,
  EditOutlined,
  StopOutlined,
} from "@ant-design/icons";
const { Option } = Select;
import UserDetailModal from "../../components/admin/UserDetailModal";
import UserAddModal from "../../components/admin/UserAddModal";
import UserEditModal from "../../components/admin/UserEditModal";
import { AdminService } from "../../services/admin.service";
import { useNavigate } from "react-router-dom";

const ManageUsers = () => {
  // users will be loaded from API
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

  const handleView = async (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
    // Fetch full user details from API
    setDetailLoading(true);
    try {
      const id = user.raw?.userId || user.key;
      const res = await AdminService.detailUser(id);
      const payload = res?.data ?? res;
      const fullUser = Array.isArray(payload) ? payload[0] : payload;

      // Map API response to component shape
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
    } catch (err) {
      console.error(err);
      notification.error("Failed to load user details");
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
    setUserList((prev) => [...prev, newUser]);
  };

  const handleBan = (user) => {
    Modal.confirm({
      title: `Ban ${user.name}?`,
      content:
        "Are you sure you want to ban this user? This action can be undone later.",
      centered: true,
      okText: "Confirm Ban",
      cancelText: "Cancel",
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
              u.key === user.key ? { ...u, status: "Suspended" } : u
            )
          );
          notification.success(`${user.name} has been banned.`);
        } catch (err) {
          console.error(err);
          notification.error(`Failed to ban ${user.name}`);
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
        // API may return array directly or inside res.data
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
          status: u.isActive
            ? "Active"
            : u.isActive === false
            ? "Suspended"
            : "Inactive",
          phone: u.phone || "",
          major: u.majorName || "",
          studentCode: u.studentCode || null,
          avatarUrl: u.avatarUrl || null,
          raw: u,
        }));

        if (mounted) setUserList(mapped);
      } catch (err) {
        console.error(err);
        notification.error("Failed to load users");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchUsers();
    return () => {
      mounted = false;
    };
  }, []);

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text) => (
        <span className="font-medium text-gray-800">{text}</span>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (text) => <span className="text-gray-500">{text}</span>,
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role) => <Tag color="blue">{role}</Tag>,
    },
    { title: "Major", dataIndex: "major", key: "major" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const colorMap = {
          Active: "green",
          Suspended: "red",
          Inactive: "default",
        };
        return (
          <Tag
            color={colorMap[status]}
            className="px-3 py-0.5 rounded-full text-xs"
          >
            {status}
          </Tag>
        );
      },
    },
    {
      title: "Actions",
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
            icon={<StopOutlined />}
            shape="circle"
            danger
            onClick={() => handleBan(record)}
            title="Ban User"
          />
        </Space>
      ),
    },
  ];

  const filteredUsers = userList.filter((user) => {
    const roleMatch =
      filters.role === "All Roles" || user.role === filters.role;
    const statusMatch =
      filters.status === "All Status" || user.status === filters.status;
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="inline-block text-4xl font-extrabold">
            Users & Roles
          </h1>
        </div>
        <Space>
          <Button
            icon={<UploadOutlined />}
            onClick={() => navigate("/admin/import-users")}
            className="!border-gray-300 hover:!border-orange-400 hover:!text-orange-400 transition-all !py-5"
          >
            Import Users
          </Button>
          <Button
            icon={<PlusOutlined />}
            onClick={() => setIsAddOpen(true)}
            className="!bg-[#FF7A00] !text-white !border-none !rounded-md !px-6 !py-5 hover:!opacity-90"
          >
            Add User
          </Button>
        </Space>
      </div>

      <div className="flex flex-col gap-6">
        {/* Filters & Table */}
        <Card
          className="shadow-sm border-gray-100"
          bodyStyle={{ padding: "20px 24px" }}
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
              <Option value="All Roles">All Roles</Option>
              <Option value="Admin">Admin</Option>
              <Option value="Mentor">Mentor</Option>
              <Option value="Student">Student</Option>
            </Select>
            <Select
              value={filters.status}
              onChange={(v) => setFilters({ ...filters, status: v })}
              className="w-full"
            >
              <Option value="All Status">All Status</Option>
              <Option value="Active">Active</Option>
              <Option value="Inactive">Inactive</Option>
              <Option value="Suspended">Suspended</Option>
            </Select>
            <Select
              value={filters.major}
              onChange={(v) => setFilters({ ...filters, major: v })}
              className="w-full"
            >
              <Option value="All Major">All Major</Option>
              <Option value="Engineering">Engineering</Option>
              <Option value="Business">Business</Option>
              <Option value="IT">IT</Option>
            </Select>
          </div>

          <Table
            columns={columns}
            dataSource={filteredUsers}
            loading={loading}
            pagination={{ pageSize: 5 }}
            bordered
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
      />
      <UserAddModal
        open={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAdd={handleAddUser}
      />
    </div>
  );
};

export default ManageUsers;
