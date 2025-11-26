import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import ConversationList from "../components/chat/ConversationList";
import ChatWindow from "../components/chat/ChatWindow";
import { useAuth } from "../context/AuthContext";
import { ChatService } from "../services/chat.service";
import { useTranslation } from "../hook/useTranslation";


const MessagesPage = () => {
  const { t } = useTranslation();
  const { userInfo } = useAuth();
  const { userId: paramUserId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [selectedSession, setSelectedSession] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [targetUserId, setTargetUserId] = useState(paramUserId || null);
  const [showChatView, setShowChatView] = useState(false);

  useEffect(() => {
    fetchConversations();
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
    try {
      const res = await ChatService.createOrGetDMConversation(userId);
      const session = res?.data;
      if (session) {
        setSelectedSession(session);
        setShowChatView(true);
        fetchConversations();
      }
    } catch (err) {
      console.error("Failed to create DM conversation:", err);
      setTargetUserId(userId);
    }
  };

  const fetchConversations = async () => {
    try {
      const res = await ChatService.getConversations();
      const data = Array.isArray(res?.data) ? res.data : [];
      setConversations(data);
    } catch (err) {
      console.error("Failed to fetch conversations:", err);
    }
  };

  const handleSelectConversation = (conversation) => {
    setSelectedSession(conversation);
    setShowChatView(true);
    setTargetUserId(null); 
  };

  const handleBackClick = () => {
    setShowChatView(false);
  };

  return (
    <div className="mt-16 mb-20 w-full h-[calc(100vh-64px)] flex bg-gray-100">
      <div
        className={`${
          showChatView ? "hidden md:flex" : "flex"
        } w-full md:w-80 bg-white border-r border-gray-200 flex-col`}
      >
        <ConversationList
          selectedSessionId={selectedSession?.sessionId}
          onSelectConversation={handleSelectConversation}
          targetUserId={targetUserId}
        />
      </div>

      {/* Chat Window Container */}
      <div className={`${showChatView ? "flex" : "hidden md:flex"} flex-1 flex-col min-h-0`}>
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
  );
};

export default MessagesPage;
