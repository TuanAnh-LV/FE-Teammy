import React, { useState, useRef } from "react";
import { FileText, Plus, Upload, X } from "lucide-react";
import { Modal, Input, notification } from "antd";
import { BoardService } from "../../../services/board.service";

export default function FilesPanel({ fileItems, t, groupId, onUploadSuccess }) {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
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
            <a 
              href={file.url} 
              target="_blank" 
              rel="noopener noreferrer"
              download
              className="inline-flex items-center gap-2 border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-white transition"
            >
              ↗ {t("download") || "Download"}
            </a>
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
    </div>
  );
}
