import React, { useState, useEffect } from "react";
import { X, Mail, Search, Plus, UserRound } from "lucide-react";
import { UserService } from "../../../services/user.service";
import { GroupService } from "../../../services/group.service";
import { useParams } from "react-router-dom";
import { notification } from "antd";

export default function AddMemberModal({ open, onClose, onAdd, t }) {
  const { id: groupId } = useParams();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setResults([]);
    setSelected(null);
  }, [open]);

  const handleSearch = async (e) => {
    const value = e.target.value;
    setQuery(value);
    if (!value.trim()) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      const res = await UserService.list({ email: value });
      const data = Array.isArray(res.data) ? res.data : [];
      setResults(
        data.map((u) => ({
          userId: u.userId,
          name: u.displayName,
          email: u.email,
          photoURL: u.avatarUrl,
        }))
      );
    } catch (err) {
      console.error("Search failed:", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (user) => {
    setSelected(user);
    setQuery(user.email);
    setResults([]);
  };

  const handleAddClick = async () => {
    if (!selected) {
      notification.warning({
        message: t("pleaseSelectUser") || "Please select a user first",
      });
      return;
    }
    if (!groupId) {
      notification.error({
        message: t("missingGroupId") || "Missing group id",
      });
      return;
    }

    try {
      setLoading(true);
      await GroupService.inviteMember(groupId, {
        userId: selected.userId,
      });
      if (typeof onAdd === "function") onAdd(selected);
      notification.success({
        message: t("inviteSent") || "Invitation sent",
      });
      onClose();
    } catch (err) {
      console.error("Invite failed:", err);
      notification.error({
        message: t("inviteFailed") || "Failed to send invitation",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="!fixed !inset-0 !bg-black/40 !backdrop-blur-sm !flex !items-center !justify-center !z-50">
      <div className="!bg-white !border !border-gray-200 !shadow-xl !rounded-2xl !p-8 !w-[90%] !max-w-md !relative">
        <button
          onClick={onClose}
          className="!absolute !top-4 !right-4 !text-gray-500 hover:!text-black"
        >
          <X className="!w-5 !h-5" />
        </button>

        <h2 className="!font-bold !text-lg !text-gray-800 !mb-4 !flex !items-center !gap-2">
          <Mail className="!w-4 !h-4 !text-gray-600" />
          {t("addMemberByEmail") || "Add member by email"}
        </h2>

        {/* Input Search */}
        <div className="relative mb-4">
          <div className="!flex !items-center !bg-gray-100 !rounded-lg !px-3 !py-2">
            <Search className="!w-4 !h-4 !text-gray-500 !mr-2" />
            <input
              type="text"
              value={query}
              onChange={handleSearch}
              placeholder={t("enterMemberEmail") || "Enter email"}
              className="!bg-transparent !outline-none !w-full !text-gray-700"
            />
          </div>

          {/* Autocomplete list */}
          {loading && (
            <p className="text-sm text-gray-500 mt-2 pl-2">Đang tìm kiếm...</p>
          )}
          {!loading && results.length > 0 && (
            <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-y-auto z-20">
              {results.map((u) => (
                <div
                  key={u.userId}
                  onClick={() => handleSelect(u)}
                  className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  {u.photoURL ? (
                    <img
                      src={u.photoURL}
                      alt={u.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <UserRound className="w-4 h-4 text-gray-500" />
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-800">
                      {u.name}
                    </span>
                    <span className="text-xs text-gray-500">{u.email}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="!flex !justify-end !gap-3 mt-4">
          <button
            onClick={onClose}
            className="!px-5 !py-2 !rounded-lg !text-gray-700 hover:!bg-gray-100 !transition"
          >
            {t("cancel") || "Cancel"}
          </button>
          <button
            onClick={handleAddClick}
            disabled={loading || !selected}
            className="!flex !items-center !gap-2 !bg-[#404040] !text-white !px-5 !py-2 !rounded-lg !font-semibold hover:!bg-black !transition"
          >
            <Plus className="!w-4 !h-4" /> {t("add") || "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}
