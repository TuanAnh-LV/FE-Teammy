import React, { useEffect, useState } from "react";
import {
  Modal,
  Tag,
  List,
  Avatar,
  Button,
  Divider,
  Space,
  Tooltip,
  Spin,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  TeamOutlined,
  CalendarOutlined,
  ProjectOutlined,
  BookOutlined,
} from "@ant-design/icons";
import { GroupService } from "../../services/group.service";

export default function GroupDetailModal({ group, open, onClose }) {
  const [groupDetail, setGroupDetail] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && group?.id) {
      fetchGroupDetails();
    }
  }, [open, group?.id]);

  const fetchGroupDetails = async () => {
    if (!group?.id) return;
    
    try {
      setLoading(true);
      const [detailRes, membersRes] = await Promise.allSettled([
        GroupService.getGroupDetail(group.id),
        GroupService.getListMembers(group.id),
      ]);

      if (detailRes.status === "fulfilled") {
        setGroupDetail(detailRes.value?.data || null);
      }

      if (membersRes.status === "fulfilled") {
        const membersList = Array.isArray(membersRes.value?.data) 
          ? membersRes.value.data 
          : [];
        setMembers(membersList);
      }
    } catch (error) {

    } finally {
      setLoading(false);
    }
  };

  if (!group) return null;

  const detail = groupDetail || group;
  const membersList = members.length > 0 ? members : [];
  const maxMembers = detail.maxMembers || detail.capacity || 5;
  const currentMembers = membersList.length || detail.currentMembers || 0;
  const availableSlot = maxMembers - currentMembers;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={900}
      centered
      destroyOnClose
      title={
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            {detail.name || "Group Details"}
          </h2>
          <p className="text-gray-400 text-xs mt-1">
            Created at: {detail.createdAt ? new Date(detail.createdAt).toLocaleString() : "N/A"}
          </p>
        </div>
      }
    >
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Spin size="large" tip="Loading group details..." />
        </div>
      ) : (
        <>
          {/* SECTION: INFO */}
          <section className="text-sm text-gray-700">
            <div className="grid grid-cols-2 gap-y-2 mb-4">
              <div>
                <span className="text-gray-500 font-medium">Major: </span>
                <span className="italic text-gray-800">
                  {detail.major?.name || detail.field || "N/A"}
                </span>
              </div>
              <div>
                <span className="text-gray-500 font-medium">Topic: </span>
                <span className="italic text-gray-800">
                  {detail.topic?.title || detail.topicName || "No topic assigned"}
                </span>
              </div>
              <div>
                <span className="text-gray-500 font-medium">Status: </span>
                <span className="italic text-gray-800 capitalize">
                  {detail.status || "Unknown"}
                </span>
              </div>
              <div>
                <span className="text-gray-500 font-medium">Semester: </span>
                <span className="italic text-gray-800">
                  {detail.semester?.season && detail.semester?.year
                    ? `${detail.semester.season} ${detail.semester.year}`
                    : "N/A"}
                </span>
              </div>
            </div>

            <Divider className="my-3" />

            <div>
              <h4 className="font-semibold text-gray-700 mb-1">Description</h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                {detail.description || "No description available"}
              </p>
            </div>

            {detail.mentor && (
              <div className="mt-4">
                <h4 className="font-semibold text-gray-700 mb-2">Current Mentor</h4>
                <div className="flex items-center gap-3 bg-blue-50 p-3 rounded-lg">
                  <Avatar
                    src={detail.mentor.avatarUrl}
                    icon={<UserOutlined />}
                    size={40}
                  />
                  <div>
                    <div className="font-medium text-gray-800">
                      {detail.mentor.displayName || detail.mentor.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {detail.mentor.email}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>

          <Divider className="my-4" />

          {/* SECTION: MEMBERS */}
          <section>
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                <TeamOutlined /> Members
              </h3>
              <span className="text-sm text-gray-500">
                Max: {maxMembers} | Available Slot:{" "}
                <strong>{availableSlot}</strong>
              </span>
            </div>

            <List
              dataSource={membersList}
              locale={{ emptyText: "No members yet" }}
              renderItem={(m, i) => (
                <List.Item
                  className={`rounded-lg px-2 py-2 ${
                    i % 2 === 0 ? "bg-gray-50" : "bg-white"
                  }`}
                >
                  <div className="flex justify-between items-center w-full">
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={m.avatarUrl || m.avatarURL || m.photoURL}
                        icon={<UserOutlined />}
                        size={40}
                        style={{
                          backgroundColor: "#b3d4fc",
                          color: "#fff",
                        }}
                      />
                      <div>
                        <div className="font-medium text-gray-800 text-sm">
                          {m.displayName || m.name || m.email}
                        </div>
                        <div className="text-xs text-gray-500">{m.email}</div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                      <span className="capitalize">{m.role || "Member"}</span>
                      <Tooltip title="Send email">
                        <a href={`mailto:${m.email}`}>
                          <MailOutlined className="cursor-pointer text-blue-500" />
                        </a>
                      </Tooltip>
                    </div>
                  </div>
                </List.Item>
              )}
            />
          </section>

          <Divider className="my-4" />

          {/* SECTION: ACTIONS */}
          <div className="flex justify-end gap-3 mt-4">
            <Button onClick={onClose}>Close</Button>
            {!detail.mentor && (
              <Button
                type="primary"
                icon={<BookOutlined />}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Mentor This Group
              </Button>
            )}
          </div>
        </>
      )}
    </Modal>
  );
}

