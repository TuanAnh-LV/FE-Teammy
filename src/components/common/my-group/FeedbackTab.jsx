import React, { useState, useEffect } from "react";
import { Search, Plus, MessageSquare, Filter } from "lucide-react";
import { Input, Select, Spin } from "antd";
import FeedbackCard from "./FeedbackCard";
import SendFeedbackModal from "./SendFeedbackModal";
import { GroupService } from "../../../services/group.service";
import { useAuth } from "../../../context/AuthContext";
import { useTranslation } from "../../../hook/useTranslation";

const { Search: SearchInput } = Input;

export default function FeedbackTab({ groupId, isMentor = false, isLeader = false, groupName = "" }) {
  const { t } = useTranslation();
  const { userInfo } = useAuth();
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (groupId) {
      fetchFeedbackList();
    }
  }, [groupId]);

  const fetchFeedbackList = async () => {
    try {
      setLoading(true);
      const response = await GroupService.getFeedbackList(groupId);
      const data = response?.data || [];
      setFeedbackList(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch feedback:", error);
      setFeedbackList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendFeedback = async (values) => {
    try {
      setSubmitting(true);
      await GroupService.createFeedback(groupId, values);
      await fetchFeedbackList();
      setSendModalOpen(false);
    } catch (error) {
      console.error("Failed to send feedback:", error);
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (feedbackId, values) => {
    try {
      await GroupService.updateFeedbackStatus(groupId, feedbackId, values);
      await fetchFeedbackList();
    } catch (error) {
      console.error("Failed to update feedback status:", error);
      throw error;
    }
  };

  const filteredFeedback = feedbackList.filter((feedback) => {
    const matchesSearch =
      !searchQuery ||
      feedback.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feedback.details?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feedback.category?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (feedback.status?.toLowerCase() === statusFilter.toLowerCase()) ||
      (statusFilter === "acknowledged" && 
       (feedback.status?.toLowerCase() === "acknowledged" || feedback.status?.toLowerCase() === "đã xác nhận")) ||
      (statusFilter === "follow_up_requested" && 
       (feedback.status?.toLowerCase() === "follow_up_requested" || feedback.status?.toLowerCase() === "chờ xử lý")) ||
      (statusFilter === "resolved" && 
       (feedback.status?.toLowerCase() === "resolved" || feedback.status?.toLowerCase() === "đã giải quyết"));

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-gray-600" />
          <h2 className="text-xl font-semibold text-gray-900">
            {t("feedbackFromMentor") || "Feedback from Mentor"}
          </h2>
          <span className="text-sm text-gray-500">
            ({filteredFeedback.length} {t("feedbackCount") || "feedback"})
          </span>
        </div>
        {isMentor && (
          <button
            onClick={() => setSendModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t("sendFeedback") || "Send Feedback"}
          </button>
        )}
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <SearchInput
            placeholder={t("searchFeedback") || "Search feedback..."}
            prefix={<Search className="w-4 h-4 text-gray-400" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            allowClear
          />
        </div>
        <div className="w-full sm:w-48">
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            className="w-full"
            suffixIcon={<Filter className="w-4 h-4 text-gray-400" />}
          >
            <Select.Option value="all">{t("allStatuses") || "All statuses"}</Select.Option>
            <Select.Option value="follow_up_requested">{t("pendingStatus") || "Pending"}</Select.Option>
            <Select.Option value="acknowledged">{t("acknowledgedStatus") || "Acknowledged"}</Select.Option>
            <Select.Option value="resolved">{t("resolvedStatus") || "Resolved"}</Select.Option>
          </Select>
        </div>
      </div>

      {/* Feedback List */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Spin size="large" />
        </div>
      ) : filteredFeedback.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">
            {searchQuery || statusFilter !== "all"
              ? (t("noFeedbackFound") || "No feedback found")
              : (t("noFeedbackYet") || "No feedback yet. Mentor will send feedback for the group.")}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredFeedback.map((feedback) => (
            <FeedbackCard
              key={feedback.id}
              feedback={feedback}
              isLeader={isLeader}
              onUpdateStatus={handleUpdateStatus}
              groupId={groupId}
            />
          ))}
        </div>
      )}

      {/* Send Feedback Modal */}
      <SendFeedbackModal
        open={sendModalOpen}
        submitting={submitting}
        groupName={groupName}
        onClose={() => {
          setSendModalOpen(false);
        }}
        onSubmit={handleSendFeedback}
      />
    </div>
  );
}

