import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate, useLocation } from "react-router-dom";
import ConversationList from "../components/chat/ConversationList";
import ChatWindow from "../components/chat/ChatWindow";
import { useAuth } from "../context/AuthContext";
import { ChatService } from "../services/chat.service";
import { useTranslation } from "../hook/useTranslation";
import { GroupService } from "../services/group.service";


const MessagesPage = () => {
  const { t } = useTranslation();
  const { userInfo } = useAuth();
  const location = useLocation();
  const { userId: paramUserId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [selectedSession, setSelectedSession] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [groupConversations, setGroupConversations] = useState([]);
  const [targetUserId, setTargetUserId] = useState(paramUserId || null);
  const [showChatView, setShowChatView] = useState(false);
  const isMentor = (userInfo?.role || "").toLowerCase() === "mentor";
  const isMentorRoute = location.pathname.startsWith("/mentor");

  useEffect(() => {
    fetchConversations();
    fetchGroupChats();
  }, []);

  useEffect(() => {
    if (!paramUserId) return;

    const existingConv = conversations.find(
      (conv) => conv.type === "dm" && conv.otherUserId === paramUserId
    );

    if (existingConv) {
      setSelectedSession(existingConv);
      setShowChatView(true);
    } else {
      createDMConversation(paramUserId);
    }
  }, [paramUserId, conversations]);

  const createDMConversation = async (userId) => {
    // Validate userId before making the request
    if (!userId || String(userId).trim() === "") {

      return;
    }
    try {
      const res = await ChatService.createOrGetDMConversation(userId);
      const session = res?.data;
      if (session) {
        setSelectedSession(session);
        setShowChatView(true);
        fetchConversations();
      }
    } catch (err) {

      setTargetUserId(userId);
    }
  };

  const fetchConversations = async () => {
    try {
      const res = await ChatService.getConversations();
      const data = Array.isArray(res?.data) ? res.data : [];
      setConversations(data);
    } catch (err) {

    }
  };

  const fetchGroupChats = async () => {
    try {
      const res = await GroupService.getMyGroups();
      const list = Array.isArray(res?.data) ? res.data : [];
      const mapped = list.map((g) => ({
        sessionId: g.id || g.groupId,
        groupId: g.id || g.groupId,
        groupName: g.name || "Group chat",
        type: "group",
      }));
      setGroupConversations(mapped);
    } catch (err) {

      setGroupConversations([]);
    }
  };

  const mergedConversations = (() => {
    const map = new Map();
    const normalize = (c) => {
      const rawType = c?.type || c?.sessionType || "";
      const type = rawType.toLowerCase().includes("group")
        ? "group"
        : rawType.toLowerCase().includes("dm") || rawType.toLowerCase().includes("direct")
        ? "dm"
        : "dm";
      const sessionId = c.sessionId || c.id || c.groupId;
      // Extract base ID for group deduplication (remove "group-" prefix if present)
      const baseId = type === "group" ? String(sessionId).replace(/^group-/, "") : sessionId;
      return { ...c, type, sessionId, baseId };
    };
    const includeGroups = !(isMentor && isMentorRoute);

    // dedupe conversations by sessionId and baseId for groups
    conversations.forEach((c) => {
      const normalized = normalize(c);
      const key = normalized.type === "group" ? `group-${normalized.baseId}` : normalized.sessionId;
      if (key) map.set(key, normalized);
    });

    if (includeGroups) {
      groupConversations.forEach((c) => {
        const normalized = normalize(c);
        const key = normalized.type === "group" ? `group-${normalized.baseId}` : normalized.sessionId;
        if (key && !map.has(key)) {
          map.set(key, normalized);
        }
      });
    }
    return Array.from(map.values());
  })();

  const handleSelectConversation = (conversation) => {
    setSelectedSession(conversation);
    setShowChatView(true);
    setTargetUserId(null); 
  };

  const handleBackClick = () => {
    setShowChatView(false);
  };

  return (
    <div
      className={`${
        isMentorRoute ? "mt-0" : "mt-16"
      } mb-20 w-full h-[calc(100vh-64px)] flex bg-gray-100`}
    >
      <div
        className={`${
          showChatView ? "hidden md:flex" : "flex"
        } w-full md:w-80 bg-white border-r border-gray-200 flex-col ${
          isMentorRoute ? "rounded-l-xl md:rounded-xl overflow-hidden shadow-sm" : ""
        }`}
      >
        <ConversationList
          selectedSessionId={selectedSession?.sessionId}
          onSelectConversation={handleSelectConversation}
          targetUserId={targetUserId}
          conversations={mergedConversations}
        />
      </div>

      {/* Chat Window Container */}
      <div
        className={`${showChatView ? "flex" : "hidden md:flex"} flex-1 flex-col min-h-0 ${
          isMentorRoute ? "p-4" : ""
        }`}
      >
        <div className="flex-1 bg-white overflow-hidden">
          {selectedSession ? (
            <ChatWindow
              session={selectedSession}
              onBackClick={handleBackClick}
              currentUser={userInfo}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <p className="text-gray-500 text-lg">
                  {t("selectConversation") || "Select a conversation to start chatting"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;

