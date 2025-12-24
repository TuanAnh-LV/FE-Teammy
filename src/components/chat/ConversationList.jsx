import React, { useEffect, useState } from "react";
import { Users, User, MessageCircle } from "lucide-react";
import { ChatService } from "../../services/chat.service";
import { useTranslation } from "../../hook/useTranslation";

const ConversationList = ({
  selectedSessionId,
  onSelectConversation,
  targetUserId,
  conversations: providedConversations = null,
  hideNewButton = false,
}) => {
  const { t } = useTranslation();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, dm, group

  useEffect(() => {
    if (providedConversations) {
      setConversations(providedConversations);
      setLoading(false);
    } else {
      fetchConversations();
    }
  }, [providedConversations]);

  const fetchConversations = async () => {
    try {
      if (providedConversations) {
        return;
      }
      setLoading(true);
      const res = await ChatService.getConversations();
      const data = Array.isArray(res?.data) ? res.data : [];
      setConversations(data);
    } catch (err) {

      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredConversations = conversations.filter((conv) => {
    const rawType = conv?.type || conv?.sessionType || "";
    const type = rawType.toLowerCase().includes("group")
      ? "group"
      : rawType.toLowerCase().includes("dm") || rawType.toLowerCase().includes("direct")
      ? "dm"
      : "dm";
    if (filter === "dm") return type === "dm";
    if (filter === "group") return type === "group";
    return true;
  });

  const highlightedConversation = targetUserId
    ? filteredConversations.find((conv) => conv.otherUserId === targetUserId)
    : null;

  const handleSelectConversation = (conv) => {
    onSelectConversation(conv);
  };

  return (
    <div className="w-full h-full flex flex-col bg-white border-r border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {t("messages") || "Messages"}
        </h2>

        {/* Filter tabs */}
        <div className="flex gap-2">
          {["all", "dm", "group"].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition ${
                filter === tab
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {tab === "all"
                ? t("all") || "All"
                : tab === "dm"
                ? t("direct") || "Direct"
                : t("group") || "Group"}
            </button>
          ))}
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-gray-500">{t("loading") || "Loading..."}</p>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-gray-500">
              {t("noConversations") || "No conversations yet."}
            </p>
          </div>
        ) : (
          filteredConversations.map((conv) => {
            const rawType = conv?.type || conv?.sessionType || "";
            const type = rawType.toLowerCase().includes("group")
              ? "group"
              : rawType.toLowerCase().includes("dm") || rawType.toLowerCase().includes("direct")
              ? "dm"
              : "dm";
            // Use normalized sessionId from merged conversations (already normalized in MessagesPage)
            const sessionKey = conv.sessionId || conv.originalSessionId || conv.id || conv.groupId;
            // Also check against originalSessionId for backward compatibility
            const originalSessionId = conv.originalSessionId || conv.sessionId || conv.id || conv.groupId;
            const isSelected = selectedSessionId === sessionKey || selectedSessionId === originalSessionId;
            const isHighlighted = highlightedConversation?.sessionId === sessionKey || highlightedConversation?.sessionId === originalSessionId;

            return (
              <button
                key={sessionKey}
                onClick={() => handleSelectConversation({ ...conv, sessionId: sessionKey, type })}
        className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition ${
                  isSelected ? "bg-blue-50 border-l-4 border-l-blue-600" : ""
                } ${isHighlighted ? "bg-yellow-50" : ""}`}
              >
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  {conv.otherAvatarUrl ? (
                    <img
                      src={conv.otherAvatarUrl}
                      alt={conv.otherDisplayName || conv.groupName}
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                      {type === "group" ? (
                        <Users className="w-5 h-5 text-gray-600" />
                      ) : (
                        <User className="w-5 h-5 text-gray-600" />
                      )}
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-gray-900 truncate">
                        {type === "group"
                          ? conv.groupName || conv.name || conv.title
                          : conv.otherDisplayName || conv.name || conv.title}
                      </p>
                      {/* Badge */}
                      <span className="flex-shrink-0 inline-flex items-center justify-center">
                        {type === "group" ? (
                          <Users className="w-4 h-4 text-blue-600" title={t("group") || "Group"} />
                        ) : (
                          <MessageCircle className="w-4 h-4 text-green-600" title={t("direct") || "Direct"} />
                        )}
                      </span>
                    </div>
                    {/* Last message preview */}
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {conv.lastMessage || t("noMessages") || "No messages"}
                    </p>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>

    </div>
  );
};

export default ConversationList;

