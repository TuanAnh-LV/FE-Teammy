import React from "react";
import { Modal } from "antd";
import { AlertTriangle } from "lucide-react";

export default function ConfirmModal({
  open,
  onCancel,
  onConfirm,
  title = "Confirm",
  message = "Are you sure you want to proceed?",
  okText = "Confirm",
  cancelText = "Cancel",
  okButtonProps = {},
  type = "default", // "default" or "danger"
}) {
  const defaultOkButtonProps = type === "danger" 
    ? {
        danger: true,
        className: "bg-red-600 hover:bg-red-700",
      }
    : {
        className: "bg-blue-600 hover:bg-blue-700",
      };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      onOk={onConfirm}
      okText={okText}
      cancelText={cancelText}
      okButtonProps={{
        ...defaultOkButtonProps,
        ...okButtonProps,
      }}
      cancelButtonProps={{
        className: "border-gray-300 text-gray-700 hover:bg-gray-50",
      }}
      title={
        <div className="flex items-center gap-2">
          {type === "danger" && (
            <AlertTriangle className="w-5 h-5 text-red-600" />
          )}
          <span className="text-lg font-semibold">{title}</span>
        </div>
      }
      width={480}
      maskClosable={false}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div 
        className="py-4"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <p className="text-gray-700">{message}</p>
      </div>
    </Modal>
  );
}

