import React, { useEffect, useRef, useState } from "react";
import { Send, Users, MessageCircle, ArrowLeft } from "lucide-react";
import { notification } from "antd";
import { ChatService } from "../../services/chat.service";
import { signalRService } from "../../services/signalr.service";
import { useTranslation } from "../../hook/useTranslation";

const MAX_MESSAGES = 50;
const TYPING_TIMEOUT_MS = 3000;

const ChatWindow = ({ session, onBackClick, currentUser }) => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});
  const messagesContainerRef = useRef(null);
  const typingTimeoutsRef = useRef({});

  const isGroupSession =
    (session?.type || session?.sessionType || "").toLowerCase().includes("group") ||
    session?.groupId;
  const effectiveSessionId = session?.sessionId || session?.id || session?.groupId;
  const effectiveGroupId = session?.groupId || session?.sessionId || session?.id;

  // auto scroll
  useEffect(() => {
    if (!messagesContainerRef.current) return;
    messagesContainerRef.current.scrollTo({
      top: messagesContainerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  // load + join realtime
  useEffect(() => {
    if (!session) return;
    fetchMessages();
    joinRealtime();
    return () => {
      if (session?.sessionId || session?.id) {
        signalRService.leaveSession(session.sessionId || session.id);
      }
    };
  }, [session?.sessionId, session?.groupId, session?.id]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = isGroupSession
        ? await ChatService.getGroupMessages(effectiveGroupId)
        : await ChatService.getMessages(effectiveSessionId);
      const data = Array.isArray(res?.data) ? res.data : [];
      const limited = data.length > MAX_MESSAGES ? data.slice(-MAX_MESSAGES) : data;
      setMessages(limited);
    } catch (err) {
      console.error("Failed to fetch messages:", err);
      notification.error({
        message: t("failedLoadMessages") || "Failed to load messages",
      });
    } finally {
      setLoading(false);
    }
  };

  const joinRealtime = async () => {
    if (!effectiveSessionId) return;
    try {
      await signalRService.start();
      await signalRService.joinSession(effectiveSessionId);
    } catch (err) {
      console.error("Join session realtime failed", err);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    const messageContent = input.trim();
    setInput("");
    try {
      setSending(true);
      const res = isGroupSession
        ? await ChatService.sendGroupMessage(effectiveGroupId, messageContent, "text")
        : await ChatService.sendMessage(effectiveSessionId, messageContent, "text");
      const newMessage = res?.data;
      if (newMessage) {
        setMessages((prev) => {
          const next = [...prev, newMessage];
          return next.length > MAX_MESSAGES ? next.slice(-MAX_MESSAGES) : next;
        });
      }
    } catch (err) {
      console.error("Failed to send message:", err);
      notification.error({
        message: t("failedSendMessage") || "Failed to send message",
      });
      setInput(messageContent);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTypingChange = (e) => {
    setInput(e.target.value);
    if (!effectiveSessionId) return;
    signalRService.typingSession(effectiveSessionId, true);
    if (typingTimeoutsRef.current.self) clearTimeout(typingTimeoutsRef.current.self);
    typingTimeoutsRef.current.self = setTimeout(() => {
      signalRService.typingSession(effectiveSessionId, false);
    }, TYPING_TIMEOUT_MS);
  };

  useEffect(() => {
    const unsubMessage = signalRService.on("ReceiveSessionMessage", (msg) => {
      if (!msg || msg.sessionId !== effectiveSessionId) return;
      setMessages((prev) => {
        const next = [...prev, msg];
        return next.length > MAX_MESSAGES ? next.slice(-MAX_MESSAGES) : next;
      });
    });
    return () => unsubMessage();
  }, [effectiveSessionId]);

  useEffect(() => {
    const cleanupTyping = () => {
      Object.values(typingTimeoutsRef.current).forEach(clearTimeout);
      typingTimeoutsRef.current = {};
    };

    const handleTypingEvent = (payload) => {
      if (!payload || payload.sessionId !== effectiveSessionId) return;
      const userId = payload.userId || payload.senderId;
      if (!userId || userId === currentUser?.userId) return;
      const displayName = payload.displayName || payload.senderDisplayName || "Someone";
      setTypingUsers((prev) => ({ ...prev, [userId]: displayName }));
      if (typingTimeoutsRef.current[userId]) {
        clearTimeout(typingTimeoutsRef.current[userId]);
      }
      typingTimeoutsRef.current[userId] = setTimeout(() => {
        setTypingUsers((prev) => {
          const next = { ...prev };
          delete next[userId];
          return next;
        });
        delete typingTimeoutsRef.current[userId];
      }, TYPING_TIMEOUT_MS);
    };

    const unsubTyping1 = signalRService.on("ReceiveTyping", handleTypingEvent);
    const unsubTyping2 = signalRService.on("TypingSession", handleTypingEvent);

    return () => {
      unsubTyping1();
      unsubTyping2();
      cleanupTyping();
    };
  }, [effectiveSessionId, currentUser?.userId]);

  if (!session) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">
            {t("selectConversation") || "Select a conversation to start chatting"}
          </p>
        </div>
      </div>
    );
  }

  const headerTitle =
    (session.type || session.sessionType || "").toLowerCase().includes("group")
      ? session.groupName || session.title || "Group chat"
      : session.otherDisplayName || session.title || "Chat";
  const headerSubtitle =
    (session.type || session.sessionType || "").toLowerCase().includes("group")
      ? t("group") || "Group"
      : t("direct") || "Direct";

  return (
    <div className="flex flex-col bg-white h-full">
      <div className="border-b border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
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
              <span className="inline-flex items-center">
                {isGroupSession ? (
                  <Users className="w-4 h-4 text-blue-600" />
                ) : (
                  <MessageCircle className="w-4 h-4 text-green-600" />
                )}
              </span>
            </div>
            <p className="text-xs text-gray-500">{headerSubtitle}</p>
          </div>
        </div>
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
                  <div key={msg.messageId || msg.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
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
                      <p className={`text-xs mt-1 ${isOwn ? "text-blue-100" : "text-gray-500"}`}>
                        {msg.createdAt
                          ? new Date(msg.createdAt).toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
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

      <div className="border-t border-gray-200 p-4 bg-white">
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
          <p className="text-xs text-gray-500 mt-2">
            {Object.values(typingUsers).join(", ")} {t("typing") || "is typing..."}
          </p>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;
