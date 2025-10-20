import React from "react";
import { Modal, Input, DatePicker, Button, Form } from "antd";

export default function AddTaskModal({ open, onClose, onCreate }) {
  const [form] = Form.useForm();

  const handleSubmit = () => {
    form
      .validateFields()
      .then((values) => {
        onCreate({
          ...values,
          startDate: values.startDate?.toISOString(),
          endDate: values.endDate?.toISOString(),
          progress: 0,
          comments: 0,
          attachments: 0,
          members: [],
        });
        form.resetFields();
      })
      .catch(() => {});
  };

  return (
    <Modal
      title={
        <h2 className="text-lg font-semibold text-gray-800">Tạo công việc</h2>
      }
      open={open}
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
      footer={null}
      centered
      width={520}
      bodyStyle={{ padding: "1.5rem 2rem" }}
    >
      <Form form={form} layout="vertical" className="space-y-3">
        <Form.Item
          label="Tên công việc"
          name="title"
          rules={[{ required: true, message: "Vui lòng nhập tên công việc" }]}
        >
          <Input placeholder="Enter task name" />
        </Form.Item>

        <Form.Item label="Mục tiêu" name="description">
          <Input.TextArea placeholder="Enter task description" rows={3} />
        </Form.Item>

        <div className="grid grid-cols-2 gap-3">
          <Form.Item
            label="Ngày bắt đầu"
            name="startDate"
            rules={[{ required: true, message: "Vui lòng chọn ngày bắt đầu" }]}
          >
            <DatePicker
              className="w-full"
              format="DD/MM/YYYY"
              placeholder="DD/MM/YYYY"
            />
          </Form.Item>

          <Form.Item
            label="Hạn hoàn thành"
            name="endDate"
            rules={[
              { required: true, message: "Vui lòng chọn hạn hoàn thành" },
            ]}
          >
            <DatePicker
              className="w-full"
              format="DD/MM/YYYY"
              placeholder="DD/MM/YYYY"
            />
          </Form.Item>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button onClick={onClose} className="!border-gray-300">
            Hủy
          </Button>
          <Button
            type="primary"
            className="!bg-gradient-to-r from-blue-500 to-indigo-500"
            onClick={handleSubmit}
          >
            Tạo
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
