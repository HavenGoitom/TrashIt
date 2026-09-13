import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context";
import { useRouter } from "../context";
import { Avatar, Spinner } from "../components/ui";
import { EmptyState } from "../components/EmptyState";
import { api, getSocket, initSocket } from "../api";
import type { Conversation, Message } from "../types";

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-ET", { hour: "2-digit", minute: "2-digit" });
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-ET", { month: "short", day: "numeric" });
}

function ConversationItem({
  conv,
  active,
  currentUserId,
  onClick,
}: {
  conv: Conversation;
  active: boolean;
  currentUserId: string;
  onClick: () => void;
}) {
  const other = conv.participants.find(p => p._id !== currentUserId);
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all text-left ${
        active ? "bg-orange-500/10 border border-orange-500/20" : "hover:bg-cream-100"
      }`}
    >
      <Avatar name={other?.name || "User"} size="md" className="flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="font-semibold text-brown-800 text-sm">{other?.name}</p>
          {conv.lastMessageAt && (
            <span className="text-[10px] text-brown-400 flex-shrink-0">{formatDate(conv.lastMessageAt)}</span>
          )}
        </div>
        <p className="text-xs text-brown-400 truncate mt-0.5">{conv.lastMessage || "No messages yet"}</p>
        <p className="text-[10px] text-orange-400 font-medium mt-0.5 truncate">re: {conv.post.title}</p>
      </div>
    </button>
  );
}

function MessageBubble({ msg, isMe }: { msg: Message; isMe: boolean }) {
  return (
    <div className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : ""}`}>
      {!isMe && <Avatar name={msg.sender.name} size="xs" className="flex-shrink-0 mb-1" />}
      <div className={`max-w-[75%] ${isMe ? "items-end" : "items-start"} flex flex-col gap-1`}>
        <div
          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
            isMe
              ? "bg-brown-800 text-warm-white rounded-br-sm"
              : "bg-warm-white border border-cream-200 text-brown-800 rounded-bl-sm"
          }`}
        >
          {msg.content}
        </div>
        <span className="text-[10px] text-brown-300 px-1">{formatTime(msg.createdAt)}</span>
      </div>
    </div>
  );
}

export default function Messages() {
  const { token, user } = useAuth();
  const { params } = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [msgLoading, setMsgLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!token) return;
    api.conversations.getAll(token).then((res) => {
      setConversations(res.conversations);
      if (params.conversationId) {
        const found = res.conversations.find(c => c._id === params.conversationId);
        if (found) loadConversation(found);
      }
    }).catch(() => setConversations([])).finally(() => setLoading(false));
  }, [token]);

  // Join conversation room and listen for real-time messages
  useEffect(() => {
    if (!activeConv || !token) return;
    const socket = getSocket() || initSocket(token);
    socket.emit("join_conversation", { conversationId: activeConv._id });

    const handleNewMessage = (msg: Message) => {
      if (msg.conversation === activeConv._id) {
        setMessages(prev => {
          // Avoid duplicates
          if (prev.some(m => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
      }
    };

    socket.on("new_message", handleNewMessage);

    return () => {
      socket.emit("leave_conversation", { conversationId: activeConv._id });
      socket.off("new_message", handleNewMessage);
    };
  }, [activeConv, token]);

  async function loadConversation(conv: Conversation) {
    setActiveConv(conv);
    setMsgLoading(true);
    try {
      const res = await api.conversations.getMessages(conv._id, token!);
      setMessages(res.messages);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch {
      setMessages([]);
    } finally {
      setMsgLoading(false);
    }
  }

  function sendMessage() {
    if (!newMsg.trim() || !activeConv || !user) return;
    setSending(true);
    const socket = getSocket();
    if (socket) {
      socket.emit("send_message", {
        conversationId: activeConv._id,
        content: newMsg.trim(),
      });
    }
    setNewMsg("");
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    setSending(false);
  }

  const otherUser = activeConv?.participants.find(p => p._id !== user?._id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <h1 className="font-display text-3xl font-semibold text-brown-900 mb-6">Messages</h1>

      <div className="bg-warm-white rounded-3xl border border-cream-200 overflow-hidden flex" style={{ height: "calc(100vh - 200px)", minHeight: "500px" }}>
        {/* Conversation list */}
        <div className={`${activeConv ? "hidden md:flex" : "flex"} flex-col w-full md:w-80 border-r border-cream-200`}>
          <div className="p-4 border-b border-cream-100">
            <p className="text-sm font-semibold text-brown-600">{conversations.length} conversation{conversations.length !== 1 ? "s" : ""}</p>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Spinner size={28} />
              </div>
            ) : conversations.length === 0 ? (
              <EmptyState
                illustration="box"
                title="No conversations yet"
                description="Browse posts and message sellers or buyers to start chatting."
                className="py-8"
              />
            ) : (
              conversations.map((conv) => (
                <ConversationItem
                  key={conv._id}
                  conv={conv}
                  active={activeConv?._id === conv._id}
                  currentUserId={user?._id || ""}
                  onClick={() => loadConversation(conv)}
                />
              ))
            )}
          </div>
        </div>

        {/* Chat area */}
        {activeConv ? (
          <div className="flex-1 flex flex-col">
            {/* Chat header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-cream-200">
              <button
                onClick={() => setActiveConv(null)}
                className="md:hidden p-1.5 rounded-lg hover:bg-cream-100 text-brown-500"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m15 18-6-6 6-6" /></svg>
              </button>
              <Avatar name={otherUser?.name || "User"} size="sm" />
              <div>
                <p className="font-semibold text-brown-800 text-sm">{otherUser?.name}</p>
                <p className="text-xs text-orange-400 font-medium">re: {activeConv.post.title}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {msgLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Spinner size={28} />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-sm text-brown-400">Start the conversation!</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <MessageBubble key={msg._id} msg={msg} isMe={msg.sender._id === user?._id} />
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-cream-200">
              <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex gap-3">
                <input
                  type="text"
                  value={newMsg}
                  onChange={(e) => setNewMsg(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-cream-50 border-2 border-cream-200 rounded-2xl px-4 py-2.5 text-sm text-brown-800 placeholder:text-brown-300 focus:outline-none focus:border-orange-400 transition-colors"
                />
                <button
                  type="submit"
                  disabled={!newMsg.trim() || sending}
                  className="w-10 h-10 bg-orange-500 text-white rounded-2xl flex items-center justify-center hover:bg-orange-600 active:scale-95 transition-all disabled:opacity-40 flex-shrink-0"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m22 2-11 11M22 2 15 22 11 13 2 9l20-7z" /></svg>
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center flex-col gap-4">
            <div className="w-16 h-16 bg-cream-100 rounded-full flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#b89672" strokeWidth="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
            </div>
            <p className="text-brown-400 text-sm">Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}