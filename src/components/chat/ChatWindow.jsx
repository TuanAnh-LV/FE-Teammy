import React, { useEffect, useRef, useState } from "react";
import { Send, Users, MessageCircle, ArrowLeft, Circle } from "lucide-react";
import { notification } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { ChatService } from "../../services/chat.service";
import { signalRService } from "../../services/signalr.service";
import { useTranslation } from "../../hook/useTranslation";
import logger from "../../utils/logger";
import MemberListDrawer from "./MemberListDrawer";
import {
  setMessages,
  addMessage,
  setTypingUser,
  removeTypingUser,
  updateSessionPresenceUser,
  removeSessionPresenceUser,
  updateGroupPresenceUser,
  removeGroupPresenceUser,
} from "../../app/chatSlice";

const MAX_MESSAGES = 50;
const TYPING_TIMEOUT_MS = 3000;

const ChatWindow = ({ session, onBackClick, currentUser, onNewMessage }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  // Get data from Redux
  const messages = useSelector(
    (state) => state.chat.messages[session?.sessionId || session?.id] || [],
    (a, b) => a === b
  );
  const typingUsers = useSelector(
    (state) => state.chat.typingUsers[session?.sessionId || session?.id] || {},
    (a, b) => a === b
  );
  const sessionPresence = useSelector(
    (state) =>
      state.chat.sessionPresence[session?.sessionId || session?.id] || {},
    (a, b) => a === b
  );
  const groupPresence = useSelector(
    (state) =>
      state.chat.groupPresence[
        session?.groupId || session?.sessionId || session?.id
      ] || {},
    (a, b) => a === b
  );

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesContainerRef = useRef(null);
  const typingTimeoutsRef = useRef({});

  const isGroupSession =
    (session?.type || session?.sessionType || "")
      .toLowerCase()
      .includes("group") || session?.groupId;
  const effectiveSessionId =
    session?.sessionId || session?.id || session?.groupId;
  const effectiveGroupId =
    session?.groupId || session?.sessionId || session?.id;

  // Auto scroll to latest message
  useEffect(() => {
    if (!messagesContainerRef.current) return;
    messagesContainerRef.current.scrollTo({
      top: messagesContainerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  // Load messages + join realtime
  useEffect(() => {
    if (!session) return;

    const initChat = async () => {
      try {
        setLoading(true);

        // Try to load messages, but don't fail if it doesn't work
        try {
          const res = isGroupSession
            ? await ChatService.getGroupMessages(effectiveGroupId)
            : await ChatService.getMessages(effectiveSessionId);
          const data = Array.isArray(res?.data) ? res.data : [];
          const limited =
            data.length > MAX_MESSAGES ? data.slice(-MAX_MESSAGES) : data;
          dispatch(
            setMessages({ sessionId: effectiveSessionId, messages: limited })
          );
        } catch (loadErr) {
          logger.error("Failed to load messages:", loadErr.message);
          dispatch(
            setMessages({ sessionId: effectiveSessionId, messages: [] })
          );
        }

        // Initialize SignalR connection
        await signalRService.start();
        await signalRService.joinSession(effectiveSessionId);

        if (isGroupSession && effectiveGroupId) {
          await signalRService.joinGroup(effectiveGroupId);
        }
      } catch (err) {
        logger.error("Failed to initialize chat:", err);

        notification.error({
          message: t("failedLoadMessages") || "Failed to initialize chat",
        });
      } finally {
        setLoading(false);
      }
    };

    initChat();

    return () => {
      if (effectiveSessionId) {
        signalRService.leaveSession(effectiveSessionId);
      }
      if (isGroupSession && effectiveGroupId) {
        signalRService.leaveGroup(effectiveGroupId);
      }
    };
  }, [
    session?.sessionId,
    session?.id,
    session?.groupId,
    isGroupSession,
    effectiveSessionId,
    effectiveGroupId,
    dispatch,
  ]);

  // Handle send message
  const handleSendMessage = async () => {
    if (!input.trim()) return;
    const messageContent = input.trim();
    setInput("");

    try {
      setSending(true);
      const res = isGroupSession
        ? await ChatService.sendGroupMessage(
            effectiveGroupId,
            messageContent,
            "text"
          )
        : await ChatService.sendMessage(
            effectiveSessionId,
            messageContent,
            "text"
          );

      // Don't manually add message - backend will broadcast via SignalR ReceiveMessage event
      // This prevents duplicate messages
    } catch (err) {
      logger.error("Failed to send message:", err);
      notification.error({
        message: t("failedSendMessage") || "Failed to send message",
      });
      setInput(messageContent);
    } finally {
      setSending(false);
      // Stop typing indicator
      if (isGroupSession) {
        await signalRService.typing(effectiveGroupId, false);
      } else {
        await signalRService.typingSession(effectiveSessionId, false);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle typing with debounce
  const handleTypingChange = (e) => {
    const newValue = e.target.value;
    setInput(newValue);

    if (!effectiveSessionId) return;

    // Send typing indicator
    const isTyping = newValue.trim().length > 0;
    if (isGroupSession) {
      signalRService.typing(effectiveGroupId, isTyping);
    } else {
      signalRService.typingSession(effectiveSessionId, isTyping);
    }

    // Clear old timeout
    if (typingTimeoutsRef.current.self) {
      clearTimeout(typingTimeoutsRef.current.self);
    }

    // Set new timeout to stop typing after delay
    typingTimeoutsRef.current.self = setTimeout(() => {
      if (isGroupSession) {
        signalRService.typing(effectiveGroupId, false);
      } else {
        signalRService.typingSession(effectiveSessionId, false);
      }
    }, TYPING_TIMEOUT_MS);
  };

  // Listen for message events
  useEffect(() => {
    const unsubMessage = signalRService.on("ReceiveMessage", (msg) => {
      if (!msg) return;

      const normalizedMsg = {
        messageId: msg.messageId || msg.id,
        sessionId: msg.sessionId || msg.SessionId,
        groupId: msg.groupId || msg.GroupId,
        content: msg.content || msg.Content,
        type: msg.type || msg.Type || "text",
        senderId: msg.senderId || msg.SenderId,
        senderDisplayName: msg.senderDisplayName || msg.SenderDisplayName,
        createdAt: msg.createdAt || msg.CreatedAt,
      };

      let msgSessionId = normalizedMsg.sessionId;
      if (!msgSessionId) {
        msgSessionId = effectiveSessionId;
        normalizedMsg.sessionId = effectiveSessionId;
      }

      if (msgSessionId !== effectiveSessionId) {
        return;
      }

      dispatch(
        addMessage({ sessionId: effectiveSessionId, message: normalizedMsg })
      );

      // Thông báo cho parent (MessagesPage) để update sidebar (last message, sort, ...)
      if (typeof onNewMessage === "function") {
        onNewMessage({
          sessionId: effectiveSessionId,
          message: normalizedMsg,
        });
      }
    });

    return () => unsubMessage();
  }, [effectiveSessionId, dispatch, onNewMessage]);

  // Listen for typing events
  useEffect(() => {
    const handleTypingEvent = (payload) => {
      if (!payload || payload.sessionId !== effectiveSessionId) return;
      const userId = payload.userId || payload.senderId;
      if (!userId || userId === currentUser?.userId) return;

      const displayName =
        payload.displayName || payload.senderDisplayName || "Someone";

      if (payload.isTyping) {
        dispatch(
          setTypingUser({ sessionId: effectiveSessionId, userId, displayName })
        );
      } else {
        dispatch(removeTypingUser({ sessionId: effectiveSessionId, userId }));
      }
    };

    const unsubReceiveTyping = signalRService.on(
      "ReceiveTyping",
      handleTypingEvent
    );
    const unsubTypingSession = signalRService.on(
      "TypingSession",
      handleTypingEvent
    );

    return () => {
      unsubReceiveTyping();
      unsubTypingSession();
    };
  }, [effectiveSessionId, currentUser?.userId, dispatch]);

  // Listen for session presence changes
  useEffect(() => {
    const handleSessionPresence = (payload) => {
      if (!payload || payload.sessionId !== effectiveSessionId) return;
      const userId = payload.userId || payload.UserId;
      if (!userId) return;

      const displayName = payload.displayName || payload.DisplayName || "User";
      const status = payload.status === "left" ? "offline" : "online";

      if (status === "offline") {
        dispatch(
          removeSessionPresenceUser({ sessionId: effectiveSessionId, userId })
        );
      } else {
        dispatch(
          updateSessionPresenceUser({
            sessionId: effectiveSessionId,
            userId,
            displayName,
            status,
          })
        );
      }
    };

    const unsub = signalRService.on(
      "SessionPresenceChanged",
      handleSessionPresence
    );
    return () => unsub();
  }, [effectiveSessionId, dispatch]);

  // Listen for group presence changes
  useEffect(() => {
    if (!isGroupSession) return;

    const handleGroupPresence = (payload) => {
      if (!payload || !effectiveGroupId) return;
      const userId = payload.userId || payload.UserId;
      if (!userId) return;

      const displayName = payload.displayName || payload.DisplayName || "User";
      const status = payload.status === "left" ? "offline" : "online";

      if (status === "offline") {
        dispatch(
          removeGroupPresenceUser({ groupId: effectiveGroupId, userId })
        );
      } else {
        dispatch(
          updateGroupPresenceUser({
            groupId: effectiveGroupId,
            userId,
            displayName,
            status,
          })
        );
      }
    };

    const unsub = signalRService.on("PresenceChanged", handleGroupPresence);
    return () => unsub();
  }, [isGroupSession, effectiveGroupId, dispatch]);

  if (!session) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">
            {t("selectConversation") ||
              "Select a conversation to start chatting"}
          </p>
        </div>
      </div>
    );
  }

  const headerTitle = (session.type || session.sessionType || "")
    .toLowerCase()
    .includes("group")
    ? session.groupName || session.title || "Group chat"
    : session.otherDisplayName || session.title || "Chat";

  let dmUserStatus = null;
  if (!isGroupSession && session?.otherUserId) {
    const otherUserPresence = sessionPresence[session.otherUserId];
    dmUserStatus = otherUserPresence?.status || null;
  }

  const headerSubtitle = (session.type || session.sessionType || "")
    .toLowerCase()
    .includes("group")
    ? t("group") || "Group"
    : t("direct") || "Direct";

  // Get presence list for header
  const presenceList = isGroupSession ? groupPresence : sessionPresence;
  const onlineCount = Object.keys(presenceList).length;
  return (
    <div className="flex flex-col bg-white h-full">
      <div className="border-b border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          {onBackClick && (
            <button
              onClick={onBackClick}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">{headerTitle}</h3>
              <span className="inline-flex items-center gap-1">
                {isGroupSession ? (
                  <>
                    <Users className="w-4 h-4 text-blue-600" />
                    <span className="text-xs text-gray-500">
                      ({onlineCount})
                    </span>
                  </>
                ) : dmUserStatus === "online" ? (
                  <>
                    <Circle className="w-2 h-2 fill-green-500 text-green-500" />
                    <span className="text-xs text-green-600">online</span>
                  </>
                ) : dmUserStatus === "offline" ? (
                  <>
                    <Circle className="w-2 h-2 fill-gray-400 text-gray-400" />
                    <span className="text-xs text-gray-500">offline</span>
                  </>
                ) : (
                  <MessageCircle className="w-4 h-4 text-green-600" />
                )}
              </span>
            </div>
            <p className="text-xs text-gray-500">{headerSubtitle}</p>
          </div>
        </div>

        <MemberListDrawer
          presence={groupPresence}
          currentUserId={currentUser?.userId}
          isGroupSession={isGroupSession}
        />
      </div>

      <div className="flex-1 bg-gray-50 min-h-0">
        <div ref={messagesContainerRef} className="h-full overflow-y-auto p-4">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-sm text-gray-500">
                {t("loading") || "Loading messages..."}
              </p>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-sm text-gray-500">
                {t("noMessages") || "No messages yet. Start the conversation!"}
              </p>
            </div>
          ) : (
            <div className="flex flex-col space-y-4 justify-end min-h-full">
              {messages.map((msg) => {
                const isOwn = msg.senderId === currentUser?.userId;
                return (
                  <div
                    key={msg.messageId || msg.id}
                    className={`flex ${
                      isOwn ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg break-words ${
                        isOwn
                          ? "bg-blue-600 text-white rounded-br-none"
                          : "bg-gray-200 text-gray-900 rounded-bl-none"
                      }`}
                    >
                      {isGroupSession && !isOwn && msg.senderDisplayName && (
                        <p className="text-xs font-semibold mb-1 text-gray-700">
                          {msg.senderDisplayName}
                        </p>
                      )}
                      <p className="text-sm break-words">{msg.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          isOwn ? "text-blue-100" : "text-gray-500"
                        }`}
                      >
                        {msg.createdAt
                          ? new Date(msg.createdAt).toLocaleTimeString(
                              "en-US",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )
                          : ""}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-gray-200 p-4 bg-white space-y-2">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={handleTypingChange}
            onKeyPress={handleKeyPress}
            placeholder={t("typeMessage") || "Type a message..."}
            disabled={sending}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
          />
          <button
            onClick={handleSendMessage}
            disabled={!input.trim() || sending}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">{t("send") || "Send"}</span>
          </button>
        </div>

        {Object.keys(typingUsers).length > 0 && (
          <p className="text-xs text-gray-500 animate-pulse">
            {Object.values(typingUsers).join(", ")}{" "}
            {t("typing") || "is typing..."}
          </p>
        )}

        {isGroupSession && onlineCount > 0 && (
          <p className="text-xs text-green-600">
            {(t("onlineCount") || "{count} members online").replace(
              "{count}",
              onlineCount
            )}
          </p>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;
