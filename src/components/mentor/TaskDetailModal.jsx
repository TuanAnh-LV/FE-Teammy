import React from "react";
import { Modal, Progress, Button, Checkbox, Avatar } from "antd";
import {
  DeleteOutlined,
  UserOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";

export default function TaskDetailModal({ open, onClose, task }) {
  if (!task) return null;

  const startDate = task.startDate
    ? new Date(task.startDate).toLocaleString("vi-VN", { hour12: false })
    : "--";
  const endDate = task.endDate
    ? new Date(task.endDate).toLocaleString("vi-VN", { hour12: false })
    : "--";

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={980}
      closable
      destroyOnClose
      bodyStyle={{
        backgroundColor: "#fff",
        borderRadius: "1rem",
        padding: "1.5rem 2rem",
      }}
    >
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-4 mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
            {task.title}
          </h2>
        </div>
      </div>

      {/* BODY */}
      <div className="grid grid-cols-12 gap-6">
        {/* LEFT */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          {/* PROGRESS */}
          <section className="p-5 border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="font-semibold text-gray-800 text-base flex items-center gap-2">
                <span className="text-blue-500">
                  <i className="ri-line-chart-line"></i>
                </span>
                Tiến độ
              </h3>
            </div>

            <div className="flex flex-wrap gap-3 bg-blue-50/60 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2 text-sm text-blue-700 bg-blue-100 px-3 py-1 rounded-full">
                <ClockCircleOutlined />
                {startDate}
              </div>
              <div className="flex items-center gap-2 text-sm text-blue-700 bg-blue-100 px-3 py-1 rounded-full">
                <CalendarOutlined />
                {endDate}
              </div>
            </div>

            <p className="text-gray-600 text-sm mb-1">Hoàn thành</p>
            <Progress
              percent={task.progress ?? 0}
              strokeColor="#22C55E"
              trailColor="#E5E7EB"
              showInfo
            />
          </section>

          {/* DESCRIPTION */}
          <section className="p-5 border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-800 text-base flex items-center gap-2">
                <i className="ri-file-list-line text-blue-500"></i> Mô tả
              </h3>
            </div>
            <p className="text-gray-600 text-sm whitespace-pre-line leading-relaxed">
              {task.description || "Chưa có mô tả"}
            </p>
          </section>

          {/* SUBTASKS */}
          <section className="p-5 border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-800 text-base flex items-center gap-2">
                <i className="ri-checkbox-line text-blue-500"></i> Công việc
              </h3>
            </div>
            {task.subtasks?.length ? (
              task.subtasks.map((t, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center py-2 px-3 hover:bg-gray-50 rounded-md transition"
                >
                  <Checkbox checked={t.done}>{t.title}</Checkbox>
                  <DeleteOutlined className="text-gray-400 hover:text-red-500 cursor-pointer" />
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-sm">Chưa có công việc con</p>
            )}
          </section>
        </div>

        {/* RIGHT */}
        <div className="col-span-12 lg:col-span-4 space-y-5">
          {/* MEMBERS */}
          <section className="p-5 border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition">
            <h3 className="font-semibold text-gray-800 text-base mb-3 flex items-center gap-2">
              <i className="ri-team-line text-blue-500"></i> Thành viên
            </h3>
            {task.members?.length ? (
              task.members.map((m, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition"
                >
                  <Avatar src={m.avatar} icon={<UserOutlined />} />
                  <span className="text-sm text-gray-700">{m.name}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-sm">Chưa có thành viên</p>
            )}
          </section>

          {/* ACTION BUTTONS */}
          <div className="space-y-3">
            <Button
              block
              className="!border-red-400 !text-red-500 hover:!bg-red-50 !rounded-lg"
            >
              Hủy tham gia
            </Button>
            <Button
              block
              type="primary"
              className="!bg-gradient-to-r from-blue-500 to-indigo-500 !rounded-lg"
            >
              Phân công
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
