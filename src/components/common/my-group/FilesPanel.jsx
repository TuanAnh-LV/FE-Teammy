import React, { useState, useRef } from "react";
import { FileText, Plus, Upload, X, MoreVertical, Download, Trash2 } from "lucide-react";
import { Modal, Input, notification, Dropdown } from "antd";
import { BoardService } from "../../../services/board.service";

export default function FilesPanel({ fileItems, t, groupId, onUploadSuccess }) {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [deletingFileId, setDeletingFileId] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);
  const fileInputRef = useRef(null);

  const handleOpenUploadModal = () => {
    setUploadModalOpen(true);
    setDescription("");
    setSelectedFile(null);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      notification.error({
        message: t("validationError") || "Validation error",
        description: t("pleaseSelectFile") || "Please select a file",
      });
      return;
    }

    if (!groupId) {
      notification.error({
        message: t("error") || "Error",
        description: t("groupIdRequired") || "Group ID is required",
      });
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", selectedFile);
      if (description.trim()) {
        formData.append("description", description.trim());
      }

      await BoardService.uploadGroupFile(groupId, formData);
      
      notification.success({
        message: t("success") || "Success",
        description: t("fileUploadedSuccess") || "File uploaded successfully",
      });

      setUploadModalOpen(false);
      setDescription("");
      setSelectedFile(null);
      
      // Callback to refresh file list
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (error) {
      console.error("Failed to upload file:", error);
      notification.error({
        message: t("uploadFailed") || "Upload failed",
        description: error?.response?.data?.message || t("pleaseTryAgain") || "Please try again",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleOpenDeleteConfirm = (file) => {
    setFileToDelete(file);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteFile = async () => {
    if (!fileToDelete) return;
    
    try {
      setDeletingFileId(fileToDelete.id);
      setDeleteConfirmOpen(false);
      await BoardService.deleteGroupFile(groupId, fileToDelete.id);
      
      notification.success({
        message: t("success") || "Success",
        description: t("fileDeletedSuccess") || "File deleted successfully",
      });

      // Callback to refresh file list
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (error) {
      console.error("Failed to delete file:", error);
      notification.error({
        message: t("deleteFailed") || "Delete failed",
        description: error?.response?.data?.message || t("pleaseTryAgain") || "Please try again",
      });
    } finally {
      setDeletingFileId(null);
      setFileToDelete(null);
    }
  };

  const getFileMenuItems = (file) => [
    {
      key: 'download',
      label: (
        <a 
          href={file.url} 
          target="_blank" 
          rel="noopener noreferrer"
          download={file.name}
          className="flex items-center gap-2 text-gray-700 capitalize"
        >
          <Download className="w-4 h-4" />
          {t("download") || "Download"}
        </a>
      ),
    },
    {
      key: 'delete',
      label: (
        <div 
          className="flex items-center gap-2 text-red-600 cursor-pointer"
          onClick={() => handleOpenDeleteConfirm(file)}
        >
          <Trash2 className="w-4 h-4" />
          {t("delete") || "Delete"}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          {t("projectFiles") || "Project Files"}
        </h3>
        <button
          type="button"
          onClick={handleOpenUploadModal}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-sm text-white font-semibold p-2.5 rounded-lg shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          {t("uploadFiles") || "Upload Files"}
        </button>
      </div>

      {fileItems.length ? (
        fileItems.map((file, index) => (
          <div
            key={`${file.name}-${index}`}
            className="flex items-center justify-between border border-gray-200 bg-[#f9fafb] rounded-xl px-4 py-3 shadow-sm"
          >
            <div className="flex items-center gap-3 min-w-0">
              <FileText className="w-6 h-6 text-blue-600" />
              <div className="min-w-0">
                <p className="font-semibold text-gray-800 truncate">{file.description || file.name}</p>
                <p className="text-xs text-gray-500 flex items-center gap-2">
                  <span>
                    {t("uploadedBy") || "Uploaded by"} {file.owner || "Team"}
                  </span>
                  {file.fileType && (
                    <>
                      <span>·</span>
                      <span className="font-semibold">{file.fileType}</span>
                    </>
                  )}
                  <span>·</span>
                  <span>{file.size}</span>
                  {file.date && (
                    <>
                      <span>·</span>
                      <span>{new Date(file.date).toLocaleDateString()}</span>
                    </>
                  )}
                </p>
              </div>
            </div>
            <Dropdown
              menu={{ items: getFileMenuItems(file) }}
              trigger={['click']}
              placement="bottomRight"
              disabled={deletingFileId === file.id}
            >
              <button
                type="button"
                className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-600 hover:bg-gray-200 transition"
                disabled={deletingFileId === file.id}
              >
                <MoreVertical className="w-5 h-5" />
              </button>
            </Dropdown>
          </div>
        ))
      ) : (
        <div className="text-sm text-gray-500">
          {t("noFilesYet") || "No files yet. Upload your first document."}
        </div>
      )}

      {/* Upload Modal */}
      <Modal
        title={t("uploadFile") || "Upload File"}
        open={uploadModalOpen}
        onOk={handleUpload}
        onCancel={() => {
          if (!uploading) {
            setUploadModalOpen(false);
            setDescription("");
            setSelectedFile(null);
          }
        }}
        okText={uploading ? t("uploading") || "Uploading..." : t("upload") || "Upload"}
        cancelText={t("cancel") || "Cancel"}
        confirmLoading={uploading}
        destroyOnClose
      >
        <div className="space-y-4 py-2">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              {t("selectFile") || "Select file"} <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition"
              >
                <Upload className="w-4 h-4" />
                {t("chooseFile") || "Choose file"}
              </button>
              {selectedFile && (
                <div className="flex items-center gap-2 flex-1 min-w-0 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                  <FileText className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700 truncate">{selectedFile.name}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="ml-auto flex-shrink-0 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              {t("description") || "Description"} <span className="text-gray-400">({t("optional") || "optional"})</span>
            </label>
            <Input.TextArea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("enterDescription") || "Enter description"}
              disabled={uploading}
            />
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-red-600">
            <Trash2 className="w-5 h-5" />
            <span>{t("deleteFileConfirm") || "Delete file"}</span>
          </div>
        }
        open={deleteConfirmOpen}
        onOk={handleDeleteFile}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setFileToDelete(null);
        }}
        okText={t("delete") || "Delete"}
        cancelText={t("cancel") || "Cancel"}
        okButtonProps={{ danger: true }}
        confirmLoading={deletingFileId === fileToDelete?.id}
        centered
      >
        <p className="text-gray-700">
          {t("deleteFileConfirmMessage") || "Are you sure you want to delete this file?"}
        </p>
        {fileToDelete && (
          <p className="mt-2 font-semibold text-gray-900">
            {fileToDelete.description || fileToDelete.name}
          </p>
        )}
      </Modal>
    </div>
  );
}
