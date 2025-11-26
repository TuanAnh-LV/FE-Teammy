import React, { useEffect, useState, useRef } from "react";
import { Send, Users, MessageCircle, ArrowLeft } from "lucide-react";
import { ChatService } from "../../services/chat.service";
import { useTranslation } from "../../hook/useTranslation";
import { notification } from "antd";

const MAX_MESSAGES = 50; // Giới hạn số tin nhắn hiển thị

const ChatWindow = ({ session, onBackClick, currentUser }) => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const messagesContainerRef = useRef(null); // khung scroll

  // Auto scroll xuống cuối trong KHUNG CHAT
  useEffect(() => {
    if (!messagesContainerRef.current) return;
    const el = messagesContainerRef.current;
    el.scrollTo({
      top: el.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  // Load messages khi đổi session
  useEffect(() => {
    if (!session?.sessionId) return;
    fetchMessages();
  }, [session?.sessionId]);

  const fetchMessages = async () => {
    if (!session?.sessionId) return;

    try {
      setLoading(true);
      const res = await ChatService.getMessages(session.sessionId);
      const data = Array.isArray(res?.data) ? res.data : [];

      const limited =
        data.length > MAX_MESSAGES ? data.slice(-MAX_MESSAGES) : data;

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

  const handleSendMessage = async () => {
    if (!input.trim() || !session?.sessionId) return;

    const messageContent = input.trim();
    setInput("");

    try {
      setSending(true);
      const res = await ChatService.sendMessage(
        session.sessionId,
        messageContent,
        "text"
      );
      const newMessage = res?.data;

      if (newMessage) {
        setMessages((prev) => {
          const next = [...prev, newMessage];
          return next.length > MAX_MESSAGES
            ? next.slice(-MAX_MESSAGES)
            : next;
        });
      }
    } catch (err) {
      console.error("Failed to send message:", err);
      notification.error({
        message: t("failedSendMessage") || "Failed to send message",
      });
      setInput(messageContent); // Restore input nếu lỗi
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

  const headerTitle =
    session.type === "group" ? session.groupName : session.otherDisplayName;
  const headerSubtitle =
    session.type === "group" ? t("group") || "Group" : t("direct") || "Direct";

  return (
    // h-full: ăn theo chiều cao của khung bên phải trong MessagesPage
    <div className="flex flex-col bg-white h-full">
      {/* Header */}
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
                {session.type === "group" ? (
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

      {/* Messages area: chiếm toàn bộ phần giữa, có scroll riêng */}
      <div className="flex-1 bg-gray-50 min-h-0">
        <div
          ref={messagesContainerRef}
          className="h-full overflow-y-auto p-4"
        >
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-sm text-gray-500">
                {t("loading") || "Loading messages..."}
              </p>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-sm text-gray-500">
                {t("noMessages") ||
                  "No messages yet. Start the conversation!"}
              </p>
            </div>
          ) : (
            // div con: min-h-full + justify-end -> ít message thì dồn xuống đáy,
            // nhiều message thì container cao hơn, scroll trong khung này
            <div className="flex flex-col space-y-4 justify-end min-h-full">
              {messages.map((msg) => {
                const isOwn = msg.senderId === currentUser?.userId;

                return (
                  <div
                    key={msg.messageId}
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
                      {session.type === "group" && !isOwn && (
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
                        {new Date(msg.createdAt).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
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
      </div>
    </div>
  );
};

export default ChatWindow;
