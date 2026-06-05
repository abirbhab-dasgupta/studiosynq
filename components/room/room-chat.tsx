"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import PusherClient from "pusher-js";
import { useChatMessages, useSendMessage } from "@/hooks/useChatMessages";
import type { ChatMessage } from "@/hooks/useChatMessages";
import { RightPanel } from "./room-panel";
import { RoomRequests } from "./room-requests";
import { Ico, P } from "@/components/dashboard/icons";
import Image from "next/image";
import { RoomInvite } from "./room-invite";

type Member = {
  userId: string;
  name: string;
  image: string | null;
  avatarColor: string | null;
  joinedAt: string;
};

type Room = {
  id: string;
  name: string;
  createdBy: string;
  members: Member[];
};

type Props = {
  roomId: string;
  user: { id: string; name: string; email: string; image?: string | null };
};

const AGENT_CONFIG: Record<string, { color: string; label: string }> = {
  codebuddy:    { color: "#10b981", label: "CodeBuddy"    },
  clarityagent: { color: "#6366f1", label: "ClarityAgent" },
  researchbot:  { color: "#D97706", label: "ResearchBot"  },
  designexpert: { color: "#ec4899", label: "DesignExpert" },
  docwriter:    { color: "#3b82f6", label: "DocWriter"    },
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

export function RoomChat({ roomId, user }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [input, setInput] = useState("");
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [agentTyping, setAgentTyping] = useState<string | null>(null);

  const { data: room, isLoading: roomLoading } = useQuery<Room>({
    queryKey: ["room", roomId],
    queryFn: () => fetch(`/api/rooms/${roomId}`).then((r) => r.json()),
    refetchInterval: 10000,
  });

  const { data: messages = [], isLoading: messagesLoading } = useChatMessages(roomId);
  const sendMessage = useSendMessage(roomId);

  const [panelOpen, setPanelOpen] = useState(() => {
  if (typeof window === "undefined") return false;
  return window.innerWidth >= 768;
});

  // Pusher real-time subscription
  useEffect(() => {
    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;
    if (!pusherKey || !pusherCluster) return;

    const pusher = new PusherClient(pusherKey, { cluster: pusherCluster });
    const channel = pusher.subscribe(`room-${roomId}`);

    channel.bind("new-message", (data: ChatMessage) => {
      queryClient.setQueryData<ChatMessage[]>(["messages", roomId], (old) => {
        if (!old) return [data];
        if (old.find((m) => m.id === data.id)) return old;
        return [...old, data];
      });
      if (data.agentName) setAgentTyping(null);
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(`room-${roomId}`);
      pusher.disconnect();
    };
  }, [roomId, queryClient]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleAgentClick = useCallback((slug: string) => {
    const agentName = AGENT_CONFIG[slug]?.label ?? slug;
    setInput((prev) => {
      const mention = `@${agentName} `;
      if (prev.includes(mention)) return prev;
      return prev ? `${prev} ${mention}` : mention;
    });
    inputRef.current?.focus();
    if (window.innerWidth < 768) setPanelOpen(false);
}, [setPanelOpen]);

  async function handleSend() {
    const content = input.trim();
    if (!content || sendMessage.isPending) return;
    setInput("");

    const mentionMatch = content.match(/@([A-Za-z]+)/);
    if (mentionMatch) {
      const slug = mentionMatch[1].toLowerCase();
      if (AGENT_CONFIG[slug]) setAgentTyping(slug);
    }

    sendMessage.mutate(content, {
      onError: () => setAgentTyping(null),
    });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  async function handleLeave() {
    setLeaving(true);
    await fetch(`/api/rooms/${roomId}/leave`, { method: "DELETE" });
    router.push("/rooms");
  }

  const groupedMessages: { date: string; messages: ChatMessage[] }[] = [];
  messages.forEach((msg) => {
    const date = formatDate(msg.createdAt);
    const last = groupedMessages[groupedMessages.length - 1];
    if (last && last.date === date) {
      last.messages.push(msg);
    } else {
      groupedMessages.push({ date, messages: [msg] });
    }
  });

  const members = room?.members ?? [];
  const isOwner = room?.createdBy === user.id;

  return (
    <div className="room-chat-shell">
      {/* Leave confirm */}
      {showLeaveConfirm && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 100,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)",
        }}>
          <div style={{
            background: "var(--bg2)", border: "1px solid var(--border-m)",
            borderRadius: 16, padding: "28px 28px 24px",
            width: 320, display: "flex", flexDirection: "column", gap: 8,
            boxShadow: "0 24px 48px rgba(0,0,0,0.3)",
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "rgba(239,68,68,0.1)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Ico d={P.logout} size={16} stroke="#ef4444" />
            </div>
            <p style={{ fontSize: 15, fontWeight: 500, color: "var(--text)", fontFamily: "var(--font-sans)" }}>
              Leave room?
            </p>
            <p style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.5, marginBottom: 8, fontFamily: "var(--font-sans)" }}>
              You&apos;ll be removed from <strong>{room?.name}</strong>.
              You&apos;ll need a new invite to rejoin.
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setShowLeaveConfirm(false)} style={{
                flex: 1, height: 34, background: "var(--surface)",
                border: "1px solid var(--border)", borderRadius: 8,
                fontSize: 12, fontWeight: 500, color: "var(--text-2)",
                cursor: "pointer", fontFamily: "var(--font-sans)",
              }}>Cancel</button>
              <button onClick={handleLeave} disabled={leaving} style={{
                flex: 1, height: 34, background: "#ef4444", border: "none",
                borderRadius: 8, fontSize: 12, fontWeight: 600, color: "#fff",
                cursor: leaving ? "not-allowed" : "pointer",
                fontFamily: "var(--font-sans)", opacity: leaving ? 0.7 : 1,
              }}>{leaving ? "Leaving..." : "Yes, leave"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="room-chat-header">
        <div className="flex items-center gap-3">
          <button className="room-workspace-back" onClick={() => router.push("/rooms")}>
            <Ico d="M19 12H5 M12 19l-7-7 7-7" size={13} stroke="var(--text-2)" />
          </button>
          <div>
            <p className="room-workspace-title">
              {roomLoading ? "Loading…" : (room?.name ?? "Room")}
            </p>
            <p className="room-workspace-subtitle">
              {members.length} member{members.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
         {isOwner && room && (
    <RoomInvite roomId={roomId} />
)}

          {!isOwner && (
            <button className="room-leave-btn" onClick={() => setShowLeaveConfirm(true)}>
              Leave room
            </button>
          )}

          <div className="room-workspace-live">
            <div className="room-workspace-live-dot" />
            <span className="room-workspace-live-label">Live</span>
          </div>

          <button
            onClick={() => setPanelOpen((p) => !p)}
            style={{
              width: 28, height: 28, borderRadius: 7,
              background: panelOpen ? "var(--surface-h)" : "var(--surface)",
              border: "1px solid var(--border)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
            }}
            title={panelOpen ? "Hide panel" : "Show panel"}
          >
            <svg width={13} height={13} viewBox="0 0 24 24" fill="none"
              stroke="var(--text-2)" strokeWidth="1.8" strokeLinecap="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M15 3v18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Join requests — owner only */}
      {isOwner && <RoomRequests roomId={roomId} />}

      {/* Body */}
      <div className="room-chat-body">
        {/* Messages */}
        <div className="room-chat-messages">
          {messagesLoading ? (
            <div className="room-chat-empty">
              <p style={{ fontSize: 13, color: "var(--text-3)" }}>Loading messages…</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="room-chat-empty">
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: "var(--surface)", border: "1px solid var(--border)",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 8,
              }}>
                <Ico d={P.chat} size={18} stroke="var(--text-3)" />
              </div>
              <p style={{ fontSize: 14, fontWeight: 500, color: "var(--text)", fontFamily: "var(--font-sans)" }}>
                No messages yet
              </p>
              <p style={{ fontSize: 12, color: "var(--text-2)", fontFamily: "var(--font-sans)", textAlign: "center" }}>
                Start the conversation or type @AgentName to call an AI agent
              </p>
            </div>
          ) : (
            <>
              {groupedMessages.map((group) => (
                <div key={group.date}>
                  <div className="room-chat-date-divider">
                    <span>{group.date}</span>
                  </div>
                  {group.messages.map((msg) => (
                    <MessageRow
                      key={msg.id}
                      msg={msg}
                      members={members}
                      currentUserId={user.id}
                    />
                  ))}
                </div>
              ))}

              {agentTyping && (
                <div className="room-chat-typing">
                  <div style={{
                    width: 24, height: 24, borderRadius: "50%",
                    background: `${AGENT_CONFIG[agentTyping]?.color}20`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 10, fontWeight: 700, flexShrink: 0,
                    color: AGENT_CONFIG[agentTyping]?.color,
                    fontFamily: "var(--font-mono)",
                  }}>
                    {AGENT_CONFIG[agentTyping]?.label[0]}
                  </div>
                  <div className="room-chat-typing-dots">
                    <span /><span /><span />
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="room-chat-input-area">
          <div className="room-chat-input-box">
            <textarea
              ref={inputRef}
              className="room-chat-textarea"
              placeholder="Message room or type @AgentName to call an agent…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
            />
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={handleSend}
                disabled={!input.trim() || sendMessage.isPending}
                className="room-chat-send-btn"
              >
                <svg width={13} height={13} viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
          </div>
          <p className="room-chat-input-hint">
            <kbd>Enter</kbd> to send · <kbd>Shift+Enter</kbd> for new line · type{" "}
            <span style={{ fontFamily: "var(--font-mono)", color: "var(--amber)" }}>
              @AgentName
            </span>{" "}
            to call an agent
          </p>
        </div>

        {/* Mobile backdrop */}
        {panelOpen && (
          <div className="room-panel-backdrop" onClick={() => setPanelOpen(false)} />
        )}

        {/* Right panel */}
        {panelOpen && (
          <RightPanel
            roomId={roomId}
            members={members}
            currentUserId={user.id}
            isOwner={isOwner}
            onAgentClick={handleAgentClick}
            onLeave={() => setShowLeaveConfirm(true)}
            onClose={() => setPanelOpen(false)}
          />
        )}
      </div>
    </div>
  );
}

function MessageRow({
  msg, members, currentUserId,
}: {
  msg: ChatMessage;
  members: Member[];
  currentUserId: string;
}) {
  const isAgent = !!msg.agentName;
  const isMe = msg.userId === currentUserId && !isAgent;
  const member = members.find((m) => m.userId === msg.userId);
  const agentConfig = msg.agentName ? AGENT_CONFIG[msg.agentName] : null;

  const displayName = isAgent
    ? (agentConfig?.label ?? msg.agentName ?? "Agent")
    : (msg.senderName ?? member?.name ?? "Unknown");

  const avatarColor = isAgent
    ? (agentConfig?.color ?? "#D97706")
    : (member?.avatarColor ?? "var(--amber-faint)");

  const avatarInitial = displayName.charAt(0).toUpperCase();

  return (
    <div className={`room-chat-msg-row ${isMe ? "room-chat-msg-row-me" : ""}`}>
      {!isMe && (
        <div style={{
          width: 28, height: 28, borderRadius: "50%",
          background: isAgent ? `${avatarColor}20` : (member?.avatarColor ?? "var(--amber-faint)"),
          border: "1px solid var(--border)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 11, fontWeight: 600,
          color: isAgent ? avatarColor : "#fff",
          fontFamily: "var(--font-mono)", flexShrink: 0,
          overflow: "hidden", marginTop: 2,
        }}>
          {!isAgent && member?.image ? (
            <Image src={member.image} alt={displayName}
              width={28} height={28}
              style={{ objectFit: "cover", borderRadius: "50%" }} />
          ) : avatarInitial}
        </div>
      )}

      <div className="room-chat-msg-body">
        {!isMe && (
          <div className="flex items-center gap-2 mb-1">
            <span style={{
              fontSize: 12, fontWeight: 600,
              color: isAgent ? (agentConfig?.color ?? "var(--amber)") : "var(--text)",
              fontFamily: "var(--font-sans)",
            }}>
              {displayName}
            </span>
            {isAgent && (
              <span style={{
                fontSize: 9, fontWeight: 600,
                padding: "1px 5px", borderRadius: 4,
                background: `${agentConfig?.color}15`,
                color: agentConfig?.color,
                border: `1px solid ${agentConfig?.color}30`,
                fontFamily: "var(--font-mono)",
              }}>AI</span>
            )}
            <span style={{ fontSize: 10, color: "var(--text-3)", fontFamily: "var(--font-mono)" }}>
              {formatTime(msg.createdAt)}
            </span>
          </div>
        )}

        <div
          className={`room-chat-bubble ${isMe ? "room-chat-bubble-me" : isAgent ? "room-chat-bubble-agent" : "room-chat-bubble-other"}`}
          style={isAgent ? { borderColor: `${agentConfig?.color}25` } : undefined}
        >
          {isMe && (
            <span style={{
              fontSize: 10, color: "rgba(255,255,255,0.5)",
              fontFamily: "var(--font-mono)", marginBottom: 2, display: "block",
            }}>
              {formatTime(msg.createdAt)}
            </span>
          )}
          <p style={{ fontSize: 13, lineHeight: 1.6, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
            {msg.content}
          </p>
        </div>
      </div>
    </div>
  );
}