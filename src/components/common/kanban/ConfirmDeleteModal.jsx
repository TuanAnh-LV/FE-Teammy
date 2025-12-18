import React, { useState } from "react";
import { Modal } from "antd";
import { AlertTriangle } from "lucide-react";

// ConfirmDeleteModal component for kanban board

export default function ConfirmDeleteModal({
  open,
  onCancel,
  onConfirm,
  title = "Confirm Delete",
  message = "This action cannot be undone. Please type 'delete' to confirm.",
  type = "column", // "column" or "task"
}) {
  const [confirmText, setConfirmText] = useState("");
  const isConfirmValid = confirmText.toLowerCase() === "delete";

  const handleConfirm = () => {
    if (isConfirmValid) {
      onConfirm();
      setConfirmText("");
    }
  };

  const handleCancel = () => {
    setConfirmText("");
    onCancel();
  };

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      onOk={handleConfirm}
      okText="Delete"
      okButtonProps={{
        danger: true,
        disabled: !isConfirmValid,
        className: !isConfirmValid
          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
          : "bg-red-600 hover:bg-red-700",
      }}
      cancelButtonProps={{
        className: "border-gray-300 text-gray-700 hover:bg-gray-50",
      }}
      title={
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <span className="text-lg font-semibold">{title}</span>
        </div>
      }
      width={480}
      maskClosable={false}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div 
        className="py-4 space-y-4"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <p className="text-gray-700">{message}</p>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type <span className="font-mono font-semibold text-red-600">delete</span> to confirm:
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            placeholder="Type 'delete' here"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            autoFocus
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === "Enter" && isConfirmValid) {
                handleConfirm();
              }
            }}
          />
          {confirmText && !isConfirmValid && (
            <p className="mt-1 text-xs text-red-600">
              Please type exactly "delete" to confirm
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
}

