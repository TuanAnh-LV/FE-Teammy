import React, { useState, useEffect } from "react";
import { Search, Plus, MessageSquare, Filter } from "lucide-react";
import { Input, Select, Spin, notification, Modal } from "antd";
import FeedbackCard from "./FeedbackCard";
import SendFeedbackModal from "./SendFeedbackModal";
import { GroupService } from "../../../services/group.service";
import { useAuth } from "../../../context/AuthContext";
import { useTranslation } from "../../../hook/useTranslation";

const { Search: SearchInput } = Input;

export default function FeedbackTab({ groupId, isMentor = false, isLeader = false, groupName = "", groupDetail = null }) {
  const { t } = useTranslation();
  const { userInfo } = useAuth();
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingFeedback, setEditingFeedback] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Verify if current user is the assigned mentor
  const isAssignedMentor = React.useMemo(() => {
    if (!isMentor || !groupDetail || !userInfo?.email) return false;
    const mentor = groupDetail?.mentor || (Array.isArray(groupDetail?.mentors) ? groupDetail.mentors[0] : null);
    if (!mentor) return false;
    const mentorEmail = (mentor.email || mentor.userEmail || "").toLowerCase();
    const currentUserEmail = userInfo.email.toLowerCase();
    return mentorEmail === currentUserEmail;
  }, [isMentor, groupDetail, userInfo]);

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
      const feedbackArray = Array.isArray(data) ? data : [];
      // Log để debug feedback structure
      if (feedbackArray.length > 0) {
        console.log("Feedback structure:", feedbackArray[0]);
      }
      setFeedbackList(feedbackArray);
    } catch (error) {
      console.error("Failed to fetch feedback:", error);
      setFeedbackList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendFeedback = async (values) => {
    // Security check: Only assigned mentor can send feedback
    if (!isAssignedMentor) {
      notification.error({
        message: t("unauthorized") || "Unauthorized",
        description: t("onlyAssignedMentorCanSendFeedback") || "Only assigned mentor can send feedback",
      });
      return;
    }
    
    try {
      setSubmitting(true);
      await GroupService.createFeedback(groupId, values);
      await fetchFeedbackList();
      setSendModalOpen(false);
      notification.success({
        message: t("feedbackSent") || "Feedback sent successfully",
      });
    } catch (error) {
      console.error("Failed to send feedback:", error);
      const errorMessage = 
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        t("sendFeedbackFailed") || 
        "Failed to send feedback";
      
      notification.error({
        message: t("error") || "Error",
        description: typeof errorMessage === "string" ? errorMessage : JSON.stringify(errorMessage),
      });
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (feedbackId, values) => {
    try {
      await GroupService.updateFeedbackStatus(groupId, feedbackId, values);
      await fetchFeedbackList();
      notification.success({
        message: t("statusUpdated") || "Status updated successfully",
      });
    } catch (error) {
      console.error("Failed to update feedback status:", error);
      const errorMessage = 
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        t("updateStatusFailed") || 
        "Failed to update status";
      
      notification.error({
        message: t("error") || "Error",
        description: typeof errorMessage === "string" ? errorMessage : JSON.stringify(errorMessage),
      });
      throw error;
    }
  };

  const handleEditFeedback = (feedback) => {
    setEditingFeedback(feedback);
    setEditModalOpen(true);
  };

  const handleUpdateFeedback = async (values) => {
    if (!editingFeedback) return;
    
    // Security check: Only assigned mentor can edit feedback
    if (!isAssignedMentor) {
      notification.error({
        message: t("unauthorized") || "Unauthorized",
        description: t("onlyAssignedMentorCanEditFeedback") || "Only assigned mentor can edit feedback",
      });
      return;
    }

    try {
      setSubmitting(true);
      const feedbackId = editingFeedback.feedbackId || editingFeedback.id || editingFeedback._id || editingFeedback.feedback_id;
      await GroupService.updateFeedback(groupId, feedbackId, values);
      await fetchFeedbackList();
      setEditModalOpen(false);
      setEditingFeedback(null);
      notification.success({
        message: t("feedbackUpdated") || "Feedback updated successfully",
      });
    } catch (error) {
      console.error("Failed to update feedback:", error);
      
      // Handle 409 error specifically
      if (error?.response?.status === 409) {
        notification.error({
          message: t("error") || "Error",
          description: t("feedbackAlreadyResolved") || "Feedback already resolved",
        });
      } else {
        const errorMessage = 
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          t("updateFeedbackFailed") || 
          "Failed to update feedback";
        
        notification.error({
          message: t("error") || "Error",
          description: typeof errorMessage === "string" ? errorMessage : JSON.stringify(errorMessage),
        });
      }
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteFeedback = (feedback) => {
    Modal.confirm({
      title: t("confirmDelete") || "Confirm Delete",
      content: t("confirmDeleteFeedback") || "Are you sure you want to delete this feedback?",
      okText: t("delete") || "Delete",
      okType: "danger",
      cancelText: t("cancel") || "Cancel",
      onOk: async () => {
        // Security check: Only assigned mentor can delete feedback
        if (!isAssignedMentor) {
          notification.error({
            message: t("unauthorized") || "Unauthorized",
            description: t("onlyAssignedMentorCanDeleteFeedback") || "Only assigned mentor can delete feedback",
          });
          return;
        }

        try {
          setSubmitting(true);
          const feedbackId = feedback.feedbackId || feedback.id || feedback._id || feedback.feedback_id;
          await GroupService.deleteFeedback(groupId, feedbackId);
          await fetchFeedbackList();
          notification.success({
            message: t("feedbackDeleted") || "Feedback deleted successfully",
          });
        } catch (error) {
          console.error("Failed to delete feedback:", error);
          
          // Handle 409 error specifically
          if (error?.response?.status === 409) {
            notification.error({
              message: t("error") || "Error",
              description: t("onlySubmittedFeedbackCanBeDeleted") || "Only submitted feedback can be deleted",
            });
          } else {
            const errorMessage = 
              error?.response?.data?.message ||
              error?.response?.data?.error ||
              error?.message ||
              t("deleteFeedbackFailed") || 
              "Failed to delete feedback";
            
            notification.error({
              message: t("error") || "Error",
              description: typeof errorMessage === "string" ? errorMessage : JSON.stringify(errorMessage),
            });
          }
        } finally {
          setSubmitting(false);
        }
      },
    });
  };

  const filteredFeedback = feedbackList.filter((feedback) => {
    // Search logic - search in multiple fields
    const searchLower = searchQuery?.toLowerCase().trim() || "";
    const matchesSearch = !searchLower || 
      feedback.summary?.toLowerCase().includes(searchLower) ||
      feedback.details?.toLowerCase().includes(searchLower) ||
      feedback.category?.toLowerCase().includes(searchLower) ||
      feedback.blockers?.toLowerCase().includes(searchLower) ||
      feedback.nextSteps?.toLowerCase().includes(searchLower) ||
      feedback.acknowledgedNote?.toLowerCase().includes(searchLower) ||
      feedback.note?.toLowerCase().includes(searchLower) ||
      feedback.mentorName?.toLowerCase().includes(searchLower) ||
      (feedback.mentor?.displayName || feedback.mentor?.name || feedback.mentor?.email || "").toLowerCase().includes(searchLower);

    // Status filter logic - normalize status values
    const feedbackStatus = (feedback.status || "").toLowerCase().trim();
    const filterStatus = (statusFilter || "").toLowerCase().trim();
    
    let matchesStatus = false;
    
    if (filterStatus === "all") {
      matchesStatus = true;
    } else if (filterStatus === "acknowledged") {
      matchesStatus = feedbackStatus === "acknowledged" || feedbackStatus === "đã xác nhận";
    } else if (filterStatus === "follow_up_requested") {
      // Check multiple possible formats for follow_up_requested
      // Normalize: remove spaces, dashes, underscores for comparison
      const normalizedFeedbackStatus = feedbackStatus.replace(/[\s\-_]/g, "").toLowerCase();
      
      matchesStatus = 
        feedbackStatus === "follow_up_requested" || 
        feedbackStatus === "follow-up-requested" ||
        feedbackStatus === "followuprequested" ||
        feedbackStatus === "follow up requested" ||
        feedbackStatus === "chờ xử lý" ||
        normalizedFeedbackStatus === "followuprequested";
    } else if (filterStatus === "resolved") {
      matchesStatus = feedbackStatus === "resolved" || feedbackStatus === "đã giải quyết";
    }

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
        {isMentor && isAssignedMentor && (
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
            <Select.Option value="follow_up_requested">{t("followUpRequestedStatus") || "Follow Up Requested"}</Select.Option>
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
          {filteredFeedback.map((feedback) => {
            // Backend returns feedbackId as the primary field
            const feedbackId = feedback.feedbackId || feedback.id || feedback._id || feedback.feedback_id || `feedback-${Math.random()}`;
            return (
              <FeedbackCard
                key={feedbackId}
                feedback={feedback}
                isLeader={isLeader}
                isMentor={isMentor && isAssignedMentor}
                onUpdateStatus={handleUpdateStatus}
                onEdit={handleEditFeedback}
                onDelete={handleDeleteFeedback}
                groupId={groupId}
              />
            );
          })}
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

      {/* Edit Feedback Modal */}
      <SendFeedbackModal
        open={editModalOpen}
        submitting={submitting}
        groupName={groupName}
        onClose={() => {
          setEditModalOpen(false);
          setEditingFeedback(null);
        }}
        onSubmit={handleUpdateFeedback}
        initialValues={editingFeedback ? {
          summary: editingFeedback.summary,
          category: editingFeedback.category,
          rating: editingFeedback.rating,
          details: editingFeedback.details,
          blockers: editingFeedback.blockers,
          nextSteps: editingFeedback.nextSteps,
        } : undefined}
      />
    </div>
  );
}

