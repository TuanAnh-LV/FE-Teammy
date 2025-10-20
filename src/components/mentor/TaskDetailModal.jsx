import React, { useState } from "react";
import {
  Modal,
  Input,
  Progress,
  Button,
  Upload,
  Checkbox,
  Avatar,
  Divider,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  SendOutlined,
  PaperClipOutlined,
  CheckCircleOutlined,
  UserOutlined,
} from "@ant-design/icons";

const { TextArea } = Input;

export default function TaskDetailModal({ open, onClose, task }) {
  const [description, setDescription] = useState(task?.description || "");
  const [subtasks, setSubtasks] = useState(task?.subtasks || []);
  const [comment, setComment] = useState("");
  const [progress, setProgress] = useState(task?.progress || 0);

  if (!task) return null;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={980}
      centered
      closable={false}
      destroyOnClose
      bodyStyle={{ padding: 0, backgroundColor: "transparent" }}
    >
      {/* MAIN CARD */}
      <div className="mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-white">{task.title}</h2>
            <p className="text-sm text-blue-100">
              Quản lý công việc chi tiết | {task.tag || "General"}
            </p>
          </div>
          <Button
            onClick={onClose}
            className="!bg-white !text-gray-700 hover:!text-red-500 font-medium !rounded-lg"
          >
            Đóng
          </Button>
        </div>

        {/* Body */}
        {/* FIX 2: padding + gap để 2 bên không dính nhau */}
        <div className="grid grid-cols-12 gap-6 p-6 md:p-8">
          {/* LEFT PANEL */}
          <div className="col-span-12 lg:col-span-8 space-y-5 overflow-y-auto max-h-[68vh] pr-1">
            {/* Progress Section */}
            <section className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-3">Tiến độ</h3>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 text-sm mb-3">
                <Input
                  type="datetime-local"
                  value={task.startDate || ""}
                  className="!rounded-lg"
                />
                <Input
                  type="datetime-local"
                  value={task.endDate || ""}
                  className="!rounded-lg"
                />
              </div>
              <Progress
                percent={progress}
                strokeColor="#43D08A"
                trailColor="#f1f5f9"
                showInfo
              />
            </section>

            {/* Description */}
            <section className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-gray-800">Mô tả</h3>
                <EditOutlined className="text-gray-500 cursor-pointer hover:text-blue-600" />
              </div>
              <TextArea
                rows={4}
                placeholder="Nhập mô tả công việc..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <div className="flex justify-end mt-3">
                <Button
                  type="primary"
                  className="!bg-gradient-to-r from-blue-500 to-indigo-500 !rounded-lg"
                >
                  Lưu thay đổi
                </Button>
              </div>
            </section>

            {/* Subtasks */}
            <section className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-3">
                Công việc con
              </h3>
              {subtasks.map((t, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center py-2 px-3 hover:bg-gray-50 rounded-lg transition"
                >
                  <Checkbox checked={t.done}>{t.title}</Checkbox>
                  <DeleteOutlined className="text-gray-400 hover:text-red-500" />
                </div>
              ))}
              <Button
                type="link"
                className="!text-blue-600 !p-0 mt-2"
                onClick={() =>
                  setSubtasks([
                    ...subtasks,
                    { title: "Công việc mới", done: false },
                  ])
                }
              >
                + Thêm công việc
              </Button>
            </section>

            {/* Attachments */}
            <section className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-3">Tệp đính kèm</h3>
              <Upload.Dragger
                multiple
                beforeUpload={() => false} // không upload thật, chỉ hiển thị
                className="!bg-gray-50 !rounded-xl border border-dashed border-gray-300"
              >
                <p className="text-gray-500 text-sm">
                  <PaperClipOutlined /> Kéo thả file hoặc nhấn để tải lên
                </p>
              </Upload.Dragger>
            </section>

            {/* Comments */}
            <section className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-3">Hoạt động</h3>
              <TextArea
                rows={2}
                placeholder="Thêm bình luận..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <div className="flex justify-end mt-3">
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  className="!bg-gradient-to-r from-blue-500 to-indigo-500 !rounded-lg"
                  onClick={() => setComment("")}
                >
                  Gửi
                </Button>
              </div>
            </section>
          </div>

          {/* RIGHT PANEL */}
          <div className="col-span-12 lg:col-span-4 space-y-5 overflow-y-auto max-h-[68vh] pl-1">
            {/* Members */}
            <section className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-3">Thành viên</h3>
              <div className="space-y-2">
                {task.members?.map((m, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between hover:bg-gray-50 p-2 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <Avatar src={m.avatar} icon={<UserOutlined />} />
                      <span className="text-sm text-gray-700">{m.name}</span>
                    </div>
                    <DeleteOutlined className="text-gray-400 hover:text-red-500" />
                  </div>
                ))}
              </div>
            </section>

            {/* Quick Actions */}
            <section className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 space-y-3">
              <Button
                block
                icon={<CheckCircleOutlined />}
                className="!bg-gradient-to-r from-green-400 to-green-500 !text-white !rounded-lg"
              >
                Hoàn thành
              </Button>
              <Button
                block
                className="!border-orange-400 !text-orange-500 !rounded-lg hover:!bg-orange-50"
              >
                Phân công
              </Button>
              <Divider className="!my-2" />
              <Button
                block
                danger
                icon={<DeleteOutlined />}
                className="!rounded-lg"
              >
                Xóa công việc
              </Button>
            </section>
          </div>
        </div>
      </div>
    </Modal>
  );
}
