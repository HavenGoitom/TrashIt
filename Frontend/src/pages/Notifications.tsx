import { useState, useEffect } from "react";
import { useAuth } from "../context";
import { useRouter } from "../context";
import { Button } from "../components/ui";
import { EmptyState } from "../components/EmptyState";
import { api } from "../api";
import type { Notification } from "../types";

function NotifIcon({ type }: { type: Notification["type"] }) {
  const icons = {
    new_message: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    new_conversation: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    match: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    post_update: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      </svg>
    ),
  };

  const colors = {
    new_message: "bg-blue-100 text-blue-600",
    new_conversation: "bg-blue-100 text-blue-600",
    match: "bg-yellow-100 text-yellow-600",
    post_update: "bg-green-100 text-green-600",
  };

  return (
    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${colors[type]}`}>
      {icons[type]}
    </div>
  );
}

function NotifItem({
  notif,
  onMarkRead,
}: {
  notif: Notification;
  onMarkRead: (id: string) => void;
}) {
  const { navigate } = useRouter();

  function handleClick() {
    if (!notif.read) onMarkRead(notif._id);
    if (notif.type === "new_message" || notif.type === "new_conversation") {
      navigate("messages", { conversationId: notif.relatedConversation });
    } else if (notif.type === "match") {
      navigate("matches");
    } else if (notif.relatedPost) {
      navigate("post-detail", { postId: notif.relatedPost._id });
    }
  }

  return (
    <div
      onClick={handleClick}
      className={`flex items-start gap-4 p-4 rounded-2xl cursor-pointer transition-colors ${
        notif.read ? "bg-warm-white hover:bg-cream-50 border border-cream-200" : "bg-orange-500/5 border border-orange-500/20 hover:bg-orange-500/10"
      }`}
    >
      <NotifIcon type={notif.type} />
      <div className="flex-1 min-w-0">
        <p className={`text-sm leading-snug ${notif.read ? "text-brown-600" : "text-brown-800 font-semibold"}`}>
          {notif.message}
        </p>
        {notif.relatedPost && (
          <p className="text-xs text-orange-400 font-medium mt-1 truncate">
            re: {notif.relatedPost.title}
          </p>
        )}
        <p className="text-xs text-brown-300 mt-1">
          {new Date(notif.createdAt).toLocaleDateString("en-ET", { month: "short", day: "numeric" })} at{" "}
          {new Date(notif.createdAt).toLocaleTimeString("en-ET", { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
      {!notif.read && (
        <div className="w-2.5 h-2.5 bg-orange-500 rounded-full flex-shrink-0 mt-1.5" />
      )}
    </div>
  );
}

export default function Notifications() {
  const { token } = useAuth();
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    api.notifications.getAll(token).then((res) => {
      setNotifs(res.notifications);
    }).finally(() => setLoading(false));
  }, [token]);

  async function markRead(id: string) {
    setNotifs(ns => ns.map(n => n._id === id ? { ...n, read: true } : n));
    if (token) await api.notifications.markRead(id, token).catch(() => {});
  }

  async function markAllRead() {
    setNotifs(ns => ns.map(n => ({ ...n, read: true })));
    if (token) await api.notifications.markAllRead(token).catch(() => {});
  }

  const unreadCount = notifs.filter(n => !n.read).length;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-semibold text-brown-900">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-orange-500 font-semibold mt-1">{unreadCount} unread</p>
          )}
        </div>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={markAllRead}>
            Mark all read
          </Button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton rounded-2xl h-20" />
          ))}
        </div>
      ) : notifs.length === 0 ? (
        <EmptyState
          illustration="box"
          title="All quiet here"
          description="You'll see notifications for new messages, matches, and post updates here."
        />
      ) : (
        <div className="space-y-2">
          {notifs.map(n => (
            <NotifItem key={n._id} notif={n} onMarkRead={markRead} />
          ))}
        </div>
      )}
    </div>
  );
}
