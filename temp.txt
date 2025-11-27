import React from "react";
import { FileText, Plus } from "lucide-react";

export default function FilesPanel({ fileItems, t }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          {t("projectFiles") || "Project Files"}
        </h3>
        <button
          type="button"
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
                <p className="font-semibold text-gray-800 truncate">{file.name}</p>
                <p className="text-xs text-gray-500 flex items-center gap-2">
                  <span>
                    {t("uploadedBy") || "Uploaded by"} {file.owner || "Team"}
                  </span>
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
            <button className="inline-flex items-center gap-2 border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-white transition">
              ↗ {t("download") || "Download"}
            </button>
          </div>
        ))
      ) : (
        <div className="text-sm text-gray-500">
          {t("noFilesYet") || "No files yet. Upload your first document."}
        </div>
      )}
    </div>
  );
}
