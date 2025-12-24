import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
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

  const [selectedSession, setSelectedSession] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [groupConversations, setGroupConversations] = useState([]);
  const [targetUserId, setTargetUserId] = useState(paramUserId || null);
  const [showChatView, setShowChatView] = useState(false);
  const isMentor = (userInfo?.role || "").toLowerCase() === "mentor";
  const isMentorRoute = location.pathname.startsWith("/mentor");

  // Helper to normalize session (same logic as in mergedConversations)
  const normalizeSession = (session) => {
    if (!session) return session;
    const rawType = session?.type || session?.sessionType || "";
    const type = rawType.toLowerCase().includes("group")
      ? "group"
      : rawType.toLowerCase().includes("dm") ||
        rawType.toLowerCase().includes("direct")
      ? "dm"
      : "dm";
    const originalSessionId = session.sessionId || session.id || session.groupId;
    const normalizedSessionId = type === "group" 
      ? String(originalSessionId).replace(/^group-/, "")
      : String(originalSessionId);
    return {
      ...session,
      type,
      sessionId: normalizedSessionId,
      originalSessionId: originalSessionId,
      groupId: type === "group" ? normalizedSessionId : session.groupId,
    };
  };

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
      setSelectedSession(normalizeSession(existingConv));
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
        setSelectedSession(normalizeSession(session));
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
    } catch (err) {}
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
    const includeGroups = !(isMentor && isMentorRoute);

    const normalize = (c) => {
      const rawType = c?.type || c?.sessionType || "";
      const type = rawType.toLowerCase().includes("group")
        ? "group"
        : rawType.toLowerCase().includes("dm") ||
          rawType.toLowerCase().includes("direct")
        ? "dm"
        : "dm";
      const originalSessionId = c.sessionId || c.id || c.groupId;
      // For groups, normalize ID by removing "group-" prefix if present and ensure it's a string
      // For DM, keep original sessionId
      const normalizedSessionId = type === "group" 
        ? String(originalSessionId || "").replace(/^group-/, "").trim()
        : String(originalSessionId || "").trim();
      
      if (!normalizedSessionId) return null;
      
      return { 
        ...c, 
        type, 
        sessionId: normalizedSessionId,
        originalSessionId: originalSessionId, // Keep original for compatibility
        groupId: type === "group" ? normalizedSessionId : c.groupId,
      };
    };

    // Generate unique key for deduplication
    // Use type + normalized sessionId to ensure uniqueness
    const getKey = (normalized) => {
      if (!normalized || !normalized.sessionId) return null;
      return `${normalized.type}-${String(normalized.sessionId)}`;
    };

    // Helper to determine which conversation to keep (prefer one with lastMessage)
    const shouldReplace = (existing, incoming) => {
      // Prefer conversation with lastMessage
      if (incoming.lastMessage && !existing.lastMessage) return true;
      if (existing.lastMessage && !incoming.lastMessage) return false;
      // If both have lastMessage, prefer newer one
      if (incoming.lastMessageAt && existing.lastMessageAt) {
        return new Date(incoming.lastMessageAt) > new Date(existing.lastMessageAt);
      }
      // Prefer incoming if it has more complete data
      return !!(incoming.lastMessage || incoming.otherDisplayName || incoming.groupName);
    };

    // First, filter out groups from conversations (we'll use groupConversations for groups)
    // and dedupe DM conversations
    conversations.forEach((c) => {
      const rawType = c?.type || c?.sessionType || "";
      const isGroup = rawType.toLowerCase().includes("group");
      
      // Skip groups from conversations array - we'll use groupConversations instead
      if (isGroup && includeGroups) return;
      
      const normalized = normalize(c);
      if (!normalized) return;
      
      const key = getKey(normalized);
      if (!key) return;
      
      if (!map.has(key)) {
        map.set(key, normalized);
      } else {
        // If key exists, decide which one to keep
        const existing = map.get(key);
        if (shouldReplace(existing, normalized)) {
          map.set(key, normalized);
        } else {
          // Merge: keep existing but update missing fields
          map.set(key, {
            ...existing,
            ...normalized,
            // Preserve important fields from existing
            lastMessage: existing.lastMessage || normalized.lastMessage,
            lastMessageAt: existing.lastMessageAt || normalized.lastMessageAt,
          });
        }
      }
    });

    // Then merge groupConversations
    if (includeGroups) {
      groupConversations.forEach((c) => {
        const normalized = normalize(c);
        if (!normalized) return;
        
        const key = getKey(normalized);
        if (!key) return;
        
        if (!map.has(key)) {
          map.set(key, normalized);
        } else {
          // If key exists, merge data but prefer existing if it has more info
          const existing = map.get(key);
          if (shouldReplace(existing, normalized)) {
            map.set(key, normalized);
          } else {
            // Merge: keep existing but update missing fields from normalized
            map.set(key, {
              ...existing,
              ...normalized,
              // Preserve important fields from existing
              lastMessage: existing.lastMessage || normalized.lastMessage,
              lastMessageAt: existing.lastMessageAt || normalized.lastMessageAt,
              groupName: existing.groupName || normalized.groupName,
            });
          }
        }
      });
    }
    return Array.from(map.values());
  })();

  const handleSelectConversation = (conversation) => {
    // Conversation from mergedConversations is already normalized, but ensure it
    setSelectedSession(normalizeSession(conversation));
    setShowChatView(true);
    setTargetUserId(null);
  };

  // Khi có tin nhắn mới (từ SignalR), cập nhật lastMessage cho sidebar
  const handleNewMessage = ({ sessionId, message }) => {
    if (!sessionId || !message) return;

    setConversations((prev) =>
      (prev || []).map((c) => {
        const cSessionId = c.sessionId || c.id || c.groupId;
        if (String(cSessionId) !== String(sessionId)) return c;
        return {
          ...c,
          lastMessage: message.content,
          lastMessageAt: message.createdAt || new Date().toISOString(),
        };
      })
    );

    // Đồng bộ luôn selectedSession để header bên phải không bị cũ
    setSelectedSession((prev) => {
      if (!prev) return prev;
      const prevSessionId = prev.sessionId || prev.id || prev.groupId;
      if (String(prevSessionId) !== String(sessionId)) return prev;
      return {
        ...prev,
        lastMessage: message.content,
        lastMessageAt: message.createdAt || new Date().toISOString(),
      };
    });
  };

  const handleBackClick = () => {
    setShowChatView(false);
  };

  return (
    <div
      className={`${
        isMentorRoute ? "mt-0" : "mt-16"
      } w-full flex bg-gray-100 ${
        isMentorRoute ? "h-screen" : "h-[calc(100vh-64px)]"
      } overflow-hidden`}
    >
      <div
        className={`${
          showChatView ? "hidden md:flex" : "flex"
        } w-full md:w-80 bg-white border-r border-gray-200 flex-col h-full ${
          isMentorRoute ? "overflow-hidden shadow-sm" : ""
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
        className={`${
          showChatView ? "flex" : "hidden md:flex"
        } flex-1 flex-col h-full min-h-0 overflow-hidden ${
          isMentorRoute
            ? "w-full flex flex-col bg-white border-r border-gray-200"
            : ""
        }`}
      >
        {selectedSession ? (
          <ChatWindow
            session={selectedSession}
            onBackClick={handleBackClick}
            currentUser={userInfo}
            onNewMessage={handleNewMessage}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50 h-full">
            <div className="text-center">
              <p className="text-gray-500 text-lg">
                {t("selectConversation") ||
                  "Select a conversation to start chatting"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;
