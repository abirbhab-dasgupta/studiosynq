"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import {
  ALL_MODELS,
  DEFAULT_MODEL_ID,
  type ModelId,
  type ModelOption,
} from "@/lib/agents/llm-router";
import { Ico, P } from "@/components/dashboard/icons";

// ── Types ──────────────────────────────────────────────────────────────────

type Message = { role: "user" | "assistant"; content: string; id: string };
type ChatSession = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
};

interface Props {
  agentName: string;
  sessionContext?: {
    roomGoal?: string;
    currentTask?: string;
    roomName?: string;
  };
}

// ── Agent meta ─────────────────────────────────────────────────────────────

const AGENT_META: Record<string, { accent: string; label: string; tagline: string }> = {
  codebuddy:    { accent: "#10b981", label: "CodeBuddy",    tagline: "Error solver · Bug finder · Code improver" },
  clarityagent: { accent: "#6366f1", label: "ClarityAgent", tagline: "Complex task → clear step-by-step plan" },
  researchbot:  { accent: "#D97706", label: "ResearchBot",  tagline: "Live web search · Structured research reports" },
  designexpert: { accent: "#ec4899", label: "DesignExpert", tagline: "UI design · Visual guidance · Design critique" },
  emailwriter:  { accent: "#3b82f6", label: "EmailWriter",  tagline: "Professional emails · Replies · Rewrites" },
};

const PLACEHOLDERS: Record<string, string> = {
  codebuddy:    "Paste code or describe a bug… (Shift+Enter for new line)",
  clarityagent: "Describe a complex task you need to plan…",
  researchbot:  "Ask a research question…",
  designexpert: "Describe your UI problem, ask for feedback, or request a design spec…",
  emailwriter:  "Describe the email you need, paste a draft to improve, or paste an email to reply to…",
};

function agentIconPath(agentName: string): string {
  return ({
    codebuddy: P.code, clarityagent: P.chat, researchbot: P.search,
    designexpert: P.star, emailwriter: P.mail,
  } as Record<string, string>)[agentName] ?? P.zap;
}

// ── localStorage helpers ───────────────────────────────────────────────────

const lsModel  = (a: string) => `studiosynq:agent:${a}:model`;
const lsActive = (a: string) => `studiosynq:agent:${a}:active`;

function readModel(a: string): ModelId {
  if (typeof window === "undefined") return DEFAULT_MODEL_ID;
  const v = localStorage.getItem(lsModel(a));
  return ALL_MODELS.find(m => m.id === v)?.id ?? DEFAULT_MODEL_ID;
}
function writeModel(a: string, id: ModelId) {
  try { localStorage.setItem(lsModel(a), id); } catch { /* ignore */ }
}
function readActiveId(a: string): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(lsActive(a));
}
function writeActiveId(a: string, id: string) {
  try { localStorage.setItem(lsActive(a), id); } catch { /* ignore */ }
}

function titleFrom(content: string): string {
  return content.slice(0, 40) + (content.length > 40 ? "…" : "");
}

// ── API helpers ────────────────────────────────────────────────────────────

async function createSessionAPI(agentName: string, title: string, messages: Message[]): Promise<ChatSession> {
  const res = await fetch(`/api/agent-sessions/${agentName}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, messages }),
  });
  if (!res.ok) throw new Error(`Failed to create session: ${res.status}`);
  return res.json();
}

async function updateSessionAPI(
  agentName: string,
  id: string,
  data: { title?: string; messages?: Message[] }
): Promise<ChatSession> {
  const res = await fetch(`/api/agent-sessions/${agentName}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to update session ${id}: ${res.status}`);
  return res.json();
}

// ── Helpers ────────────────────────────────────────────────────────────────

type SDKPart = { type: string; text?: string };
type SDKMsg  = { role: string; parts?: SDKPart[]; content?: string };

function extractText(m: SDKMsg): string {
  if (Array.isArray(m.parts)) {
    const t = m.parts
      .filter((p): p is { type: "text"; text: string } => p.type === "text" && typeof p.text === "string")
      .map(p => p.text)
      .join("");
    if (t) return t;
  }
  return typeof m.content === "string" ? m.content : "";
}

// ══════════════════════════════════════════════════════════════════════════
// Component
// ══════════════════════════════════════════════════════════════════════════

export function AgentChatPanel({ agentName, sessionContext }: Props) {
  const meta        = AGENT_META[agentName] ?? { accent: "#10b981", label: agentName, tagline: "" };
  const isResearch  = agentName === "researchbot";
  const queryClient = useQueryClient();

  // ── Core state ──────────────────────────────────────────────────────────

  const [activeId,  setActiveId]  = useState<string | null>(null);
  const [histOpen,  setHistOpen]  = useState(false);
  const [modelOpen, setModelOpen] = useState(false);
  const [modelId,   setModelId]   = useState<ModelId>(DEFAULT_MODEL_ID);
  const [mounted,   setMounted]   = useState(false);

  // ── Stable refs ─────────────────────────────────────────────────────────

  // These refs always mirror their state counterparts so callbacks never go stale.
  const activeIdRef      = useRef<string | null>(null);
  const modelIdRef       = useRef<ModelId>(DEFAULT_MODEL_ID);
  const activeTitleRef   = useRef<string>("New chat");
  const isSavingRef      = useRef(false);           // prevent concurrent PATCH calls
  const pendingSaveRef   = useRef<Message[] | null>(null); // queue at most one pending save

  // ── Session list ────────────────────────────────────────────────────────

  const { data: sessions = [], isLoading: sessionsLoading } = useQuery<ChatSession[]>({
    queryKey: ["agent-sessions", agentName],
    queryFn:  () => fetch(`/api/agent-sessions/${agentName}`).then(r => r.json()),
    enabled:  mounted,
    staleTime: 30_000,
  });

  const activeSession = useMemo(
    () => sessions.find(s => s.id === activeId) ?? null,
    [sessions, activeId]
  );

  // Keep activeTitleRef in sync
  useEffect(() => {
    activeTitleRef.current = activeSession?.title ?? "New chat";
  }, [activeSession?.title]);

  // ── Mount ────────────────────────────────────────────────────────────────

  useEffect(() => {
    const m = readModel(agentName);
    setModelId(m);
    modelIdRef.current = m;
    setMounted(true);
  }, [agentName]);

  // ── Bootstrap first session / restore active ────────────────────────────

  useEffect(() => {
    if (!mounted || sessionsLoading) return;

    if (sessions.length === 0) {
      createSessionAPI(agentName, "New chat", []).then(s => {
        queryClient.setQueryData<ChatSession[]>(["agent-sessions", agentName], [s]);
        setActiveId(s.id);
        activeIdRef.current = s.id;
        writeActiveId(agentName, s.id);
      }).catch(console.error);
      return;
    }

    const savedId = readActiveId(agentName);
    const target  = (savedId && sessions.find(s => s.id === savedId))
      ? savedId
      : sessions[0].id;

    setActiveId(target);
    activeIdRef.current = target;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, sessionsLoading]);

  // ── Serialised save ─────────────────────────────────────────────────────
  //
  // Only one PATCH in-flight at a time. If a new save arrives while one is
  // running, it is queued and replaces any previously queued request (last-
  // write-wins semantics — we only need the latest snapshot).
  //
  const flushSave = useCallback(async (messages: Message[], title?: string) => {
    const id = activeIdRef.current;
    if (!id) return;

    if (isSavingRef.current) {
      // Overwrite queue; we only need the latest
      pendingSaveRef.current = messages;
      return;
    }

    isSavingRef.current = true;
    try {
      const updated = await updateSessionAPI(agentName, id, {
        messages,
        ...(title !== undefined ? { title } : {}),
      });
      queryClient.setQueryData<ChatSession[]>(["agent-sessions", agentName], old =>
        old?.map(s => s.id === updated.id ? updated : s) ?? []
      );
    } catch (err) {
      console.error("[AgentChatPanel] save failed:", err);
    } finally {
      isSavingRef.current = false;
      // Drain queued save if any
      if (pendingSaveRef.current) {
        const queued = pendingSaveRef.current;
        pendingSaveRef.current = null;
        flushSave(queued);
      }
    }
  }, [agentName, queryClient]);

  // ── useChat (streaming agents) ──────────────────────────────────────────

  const { messages: sdkMsgs, sendMessage, status, error, setMessages } = useChat({
    transport: new DefaultChatTransport({
      api: `/api/agents/${agentName}`,
      prepareSendMessagesRequest({ messages }) {
        // Send full conversation history so the LLM has context.
        // Convert SDK UIMessage format → plain {role, content} the server expects.
        const history = messages.map(m => ({
          role:    m.role as "user" | "assistant",
          content: extractText(m as SDKMsg),
        }));
        return {
          body: {
            messages: history,
            modelId: modelIdRef.current,
            ...(sessionContext ?? {}),
          },
        };
      },
    }),
    onFinish: useCallback(({ messages: finishedMsgs }: { messages: Array<{ id: string; role: string; parts?: Array<{ type: string; text?: string }>; content?: string }> }) => {
      // Called once streaming completes. `finishedMsgs` is the full conversation
      // including the just-completed assistant turn (AI SDK v5 signature).
      const id = activeIdRef.current;
      if (!id || isResearch) return;

      const plainMsgs: Message[] = finishedMsgs.map(m => ({
        role:    m.role as "user" | "assistant",
        content: extractText(m),
        id:      m.id,
      }));

      const currentTitle = activeTitleRef.current;
      const firstUser    = plainMsgs.find(m => m.role === "user");
      const newTitle     = currentTitle === "New chat" && firstUser
        ? titleFrom(firstUser.content)
        : currentTitle;

      flushSave(plainMsgs, newTitle !== currentTitle ? newTitle : undefined);
    }, [isResearch, flushSave]),
  });

  const isStreaming = status === "streaming" || status === "submitted";

  // ── Keep a ref-stable copy of sdkMsgs for use in onFinish ───────────────

  const sdkMsgsCacheRef = useRef(sdkMsgs);
  useEffect(() => {
    sdkMsgsCacheRef.current = sdkMsgs;
  });

  // ── Flat Message[] view of SDK messages (for rendering) ─────────────────
  // Recompute on every render during streaming (not just length changes)
  // so the user sees tokens as they arrive.

  const chatMsgs = useMemo<Message[]>(
    () => sdkMsgs.map(m => ({
      role:    m.role as "user" | "assistant",
      content: extractText(m as SDKMsg),
      id:      m.id,
    })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sdkMsgs]   // ← full dep, not .length — ensures streaming tokens are shown
  );

  // ── Restore SDK messages when active session changes ─────────────────────

  useEffect(() => {
    if (isResearch || !activeId || !mounted || isStreaming) return;
    const session = sessions.find(s => s.id === activeId);
    if (!session) return;

    setMessages(session.messages.map(m => ({
      id:      m.id,
      role:    m.role,
      content: m.content,
      parts:   [{ type: "text" as const, text: m.content }],
    })));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId, mounted]);  // intentional: only fire when session switches

  // ── Session management ───────────────────────────────────────────────────

  function newChat() {
    createSessionAPI(agentName, "New chat", []).then(s => {
      queryClient.setQueryData<ChatSession[]>(
        ["agent-sessions", agentName],
        old => [s, ...(old ?? [])]
      );
      setActiveId(s.id);
      activeIdRef.current = s.id;
      writeActiveId(agentName, s.id);
      setHistOpen(false);
      setResInput("");
      setChatInput("");
      resetTextarea();
      setMessages([]);
    }).catch(console.error);
  }

  function pickSession(id: string) {
    if (id === activeIdRef.current) return;
    setActiveId(id);
    activeIdRef.current = id;
    writeActiveId(agentName, id);
    setHistOpen(false);
  }

  function dropSession(id: string) {
    fetch(`/api/agent-sessions/${agentName}/${id}`, { method: "DELETE" })
      .then(() => {
        queryClient.setQueryData<ChatSession[]>(["agent-sessions", agentName], old => {
          const next = old?.filter(s => s.id !== id) ?? [];
          if (activeIdRef.current === id) {
            const newId = next[0]?.id ?? null;
            setActiveId(newId);
            activeIdRef.current = newId;
            if (newId) writeActiveId(agentName, newId);
          }
          return next;
        });
      })
      .catch(console.error);
  }

  function selectModel(id: ModelId) {
    setModelId(id);
    modelIdRef.current = id;
    writeModel(agentName, id);
    setModelOpen(false);
  }

  // ── ResearchBot (non-streaming) ──────────────────────────────────────────

  const [resInput,   setResInput]   = useState("");
  const [resLoading, setResLoading] = useState(false);
  const [resError,   setResError]   = useState<string | null>(null);
  const resMessages = activeSession?.messages ?? [];

  async function submitResearch(e: React.FormEvent) {
    e.preventDefault();
    const msg = resInput.trim();
    if (!msg || resLoading || !activeSession) return;

    setResInput("");
    resetTextarea();
    setResError(null);

    const userMsg: Message  = { role: "user", content: msg, id: crypto.randomUUID() };
    const updated: Message[] = [...activeSession.messages, userMsg];
    const isFirst  = activeSession.messages.filter(m => m.role === "user").length === 0;
    const newTitle = isFirst ? titleFrom(msg) : activeSession.title;

    // Optimistic UI
    queryClient.setQueryData<ChatSession[]>(["agent-sessions", agentName], old =>
      old?.map(s => s.id === activeIdRef.current
        ? { ...s, messages: updated, title: newTitle }
        : s
      ) ?? []
    );

    setResLoading(true);
    try {
      const history = activeSession.messages.map(m => ({ role: m.role, content: m.content }));
      const res  = await fetch(`/api/agents/${agentName}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, history, modelId: modelIdRef.current }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Request failed");

      const asst: Message  = { role: "assistant", content: data.text, id: crypto.randomUUID() };
      const final: Message[] = [...updated, asst];

      queryClient.setQueryData<ChatSession[]>(["agent-sessions", agentName], old =>
        old?.map(s => s.id === activeIdRef.current ? { ...s, messages: final } : s) ?? []
      );

      flushSave(final, newTitle !== activeSession.title ? newTitle : undefined);
    } catch (err) {
      setResError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setResLoading(false);
    }
  }

  // ── Streaming submit ─────────────────────────────────────────────────────

  const [chatInput, setChatInput] = useState("");

  async function submitChat(e: React.FormEvent) {
    e.preventDefault();
    const msg = chatInput.trim();
    if (!msg || isStreaming || !activeIdRef.current) return;
    setChatInput("");
    resetTextarea();
    await sendMessage({ text: msg });
  }

  function onKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      isResearch
        ? submitResearch(e as unknown as React.FormEvent)
        : submitChat(e as unknown as React.FormEvent);
    }
  }

  const msgs    = isResearch ? resMessages : chatMsgs;
  const loading = isResearch ? resLoading  : isStreaming;
  const errMsg  = isResearch ? resError    : (error?.message ?? null);

  // ── Scroll ───────────────────────────────────────────────────────────────

  const bottomRef        = useRef<HTMLDivElement>(null);
  const messagesRef      = useRef<HTMLDivElement>(null);
  const userScrollingRef = useRef(false);
  const scrollTimerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const el = messagesRef.current;
    if (!el) return;
    const onScroll = () => {
      const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
      userScrollingRef.current = !atBottom;
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
      scrollTimerRef.current = setTimeout(() => { userScrollingRef.current = false; }, 2000);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // Auto-scroll on new content
  useEffect(() => {
    if (userScrollingRef.current) return;
    const raf = requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ behavior: loading ? "instant" : "smooth" });
    });
    return () => cancelAnimationFrame(raf);
  }, [msgs.length, loading]);

  // ── Textarea resize ──────────────────────────────────────────────────────

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function autoResize(el: HTMLTextAreaElement | null) {
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.max(Math.min(el.scrollHeight, 160), 24) + "px";
  }

  function resetTextarea() {
    if (textareaRef.current) textareaRef.current.style.height = "24px";
  }

  const inputVal = isResearch ? resInput : chatInput;
  const setInput = useCallback((v: string) => {
    isResearch ? setResInput(v) : setChatInput(v);
  }, [isResearch]);

  // ── Model picker close on outside click ─────────────────────────────────

  const modelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (modelRef.current && !modelRef.current.contains(e.target as Node)) {
        setModelOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const currentModel = ALL_MODELS.find(m => m.id === modelId) ?? ALL_MODELS[0];

  if (!mounted) return null;

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="agent-shell">

      {/* ── History sidebar ── */}
      <aside className={`agent-sidebar${histOpen ? " open" : ""}`}>
        <div className="agent-sidebar-head">
          <span className="agent-sidebar-label">History</span>
          <button
            className="agent-sidebar-new"
            style={{ background: meta.accent + "20", color: meta.accent }}
            onClick={newChat}
          >
            + New
          </button>
        </div>
        <div className="agent-sidebar-list">
          {sessionsLoading ? (
            <p style={{ fontSize: 11, color: "var(--text-3)", padding: "8px 10px" }}>Loading…</p>
          ) : sessions.map(s => (
            <div
              key={s.id}
              className={`agent-session-item${s.id === activeId ? " active" : ""}`}
              onClick={() => pickSession(s.id)}
            >
              <span className="agent-session-title">{s.title}</span>
              <button
                className="agent-session-del"
                onClick={ev => { ev.stopPropagation(); dropSession(s.id); }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="agent-main">

        {/* Header */}
        <div className="agent-header">
          <button
            className={`agent-header-toggle${histOpen ? " active" : ""}`}
            onClick={() => setHistOpen(v => !v)}
            title="Chat history"
          >
            <Ico d={P.menu} size={14} stroke="currentColor" />
          </button>

          <div className="agent-header-icon" style={{ background: meta.accent + "18" }}>
            <Ico d={agentIconPath(agentName)} size={15} stroke={meta.accent} />
          </div>

          <div className="agent-header-info">
            <div className="agent-header-name">{meta.label}</div>
            <div className="agent-header-tagline">{meta.tagline}</div>
          </div>

          <div className="agent-header-actions">
            {/* Model picker */}
            <div className="agent-model-picker" ref={modelRef}>
              <button
                className="agent-model-trigger"
                onClick={() => setModelOpen(v => !v)}
                title="Choose model"
              >
                <span className="agent-model-dot" style={{ background: currentModel.badgeColor }} />
                <span className="agent-model-name">{currentModel.label}</span>
                <span className="agent-model-caret">▾</span>
              </button>

              {modelOpen && (
                <div className="agent-model-dropdown">
                  <div className="agent-model-dropdown-head">Choose model</div>
                  {(["groq", "gemini", "mistral"] as const).map(provider => {
                    const providerModels = ALL_MODELS.filter(m => m.provider === provider);
                    return (
                      <div key={provider}>
                        <div
                          className="agent-model-provider-label"
                          style={{ color: providerModels[0].providerColor }}
                        >
                          {providerModels[0].providerLabel}
                        </div>
                        {providerModels.map((m: ModelOption) => (
                          <button
                            key={m.id}
                            className={`agent-model-option${m.id === modelId ? " selected" : ""}`}
                            onClick={() => selectModel(m.id)}
                          >
                            <div className="agent-model-option-top">
                              <span className="agent-model-option-label">{m.label}</span>
                              <span
                                className="agent-model-option-badge"
                                style={{ background: m.badgeColor + "20", color: m.badgeColor }}
                              >
                                {m.badge}
                              </span>
                            </div>
                            <div className="agent-model-option-desc">{m.description}</div>
                          </button>
                        ))}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <button className="agent-new-btn" onClick={newChat}>
              + <span>New chat</span>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="agent-messages" ref={messagesRef}>
          {msgs.length === 0 && (
            <div className="agent-empty">
              <div className="agent-empty-symbol">
                <Ico d={agentIconPath(agentName)} size={32} stroke={meta.accent} />
              </div>
              <div className="agent-empty-title">Ask {meta.label} anything</div>
              <div className="agent-empty-sub">{meta.tagline}</div>
              <div className="agent-empty-hint">
                <kbd className="agent-kbd">Enter</kbd>
                <span>to send</span>
                <kbd className="agent-kbd">Shift+Enter</kbd>
                <span>for new line</span>
              </div>
            </div>
          )}

          {msgs.map((msg: Message) => (
            <div key={msg.id} className={`agent-msg-row ${msg.role}`}>
              <div
                className={`agent-msg-bubble ${msg.role}`}
                style={msg.role === "user"
                  ? { background: meta.accent + "1a", border: `1px solid ${meta.accent}38` }
                  : undefined}
              >
                {msg.role === "user" ? (
                  <span style={{ whiteSpace: "pre-wrap" }}>{msg.content}</span>
                ) : (
                  <MD content={msg.content} accent={meta.accent} />
                )}
              </div>
              {msg.role === "assistant" && msg.content && (
                <CopyBtn text={msg.content} accent={meta.accent} />
              )}
            </div>
          ))}

          {loading && (
            <div>
              <div className="agent-loading-bubble" style={{ color: "var(--text-2)" }}>
                {isResearch ? (
                  <>
                    <span style={{ color: meta.accent, fontSize: 10 }}>●</span>
                    <span style={{ fontSize: 12 }}>
                      {process.env.NEXT_PUBLIC_TAVILY_ENABLED === "true"
                        ? "Searching the web…"
                        : "Searching knowledge base…"}
                    </span>
                  </>
                ) : (
                  <Dots color={meta.accent} />
                )}
              </div>
            </div>
          )}

          {errMsg && <div className="agent-error">{errMsg}</div>}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="agent-input-area">
          <form
            onSubmit={isResearch ? submitResearch : submitChat}
            className="agent-input-box"
          >
            <textarea
              ref={textareaRef}
              value={inputVal}
              rows={1}
              disabled={loading}
              placeholder={PLACEHOLDERS[agentName] ?? "Ask anything…"}
              className="agent-textarea"
              style={{ minHeight: "24px" }}
              onChange={e => { setInput(e.target.value); autoResize(e.target); }}
              onKeyDown={onKey}
            />
            <button
              type="submit"
              disabled={loading || !inputVal.trim()}
              className="agent-send-btn"
              style={{
                background: loading || !inputVal.trim() ? "var(--surface)" : meta.accent,
                color:      loading || !inputVal.trim() ? "var(--text-3)"  : "#fff",
              }}
            >
              <Ico d={P.chevR} size={16} stroke="currentColor" />
            </button>
          </form>
          <p className="agent-input-footer">
            AI can make mistakes — always verify important responses
          </p>
        </div>

      </div>
    </div>
  );
}

// ── Copy button ────────────────────────────────────────────────────────────

function CopyBtn({ text, accent }: { text: string; accent: string }) {
  const [done, setDone] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setDone(true);
    setTimeout(() => setDone(false), 2000);
  }

  return (
    <button
      className="agent-msg-copy"
      onClick={copy}
      style={{ color: done ? accent : "var(--text-3)" }}
    >
      {done ? "✓ Copied" : "Copy"}
    </button>
  );
}

// ── HTML doc wrapper ───────────────────────────────────────────────────────

function ensureHtmlDoc(html: string): string {
  const t = html.trim();
  if (t.toLowerCase().startsWith("<!doctype") || t.toLowerCase().startsWith("<html")) return t;
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:-apple-system,sans-serif}</style></head><body>${t}</body></html>`;
}

// ── Code block ────────────────────────────────────────────────────────────

function Code({ className, children }: { className?: string; children?: React.ReactNode }) {
  const match    = /language-(\w+)/.exec(className || "");
  const str      = String(children).replace(/\n$/, "");
  const [done,     setDone]     = useState(false);
  const [expanded, setExpanded] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(str);
    setDone(true);
    setTimeout(() => setDone(false), 2000);
  }

  if (!match) {
    return (
      <code style={{
        background: "rgba(255,255,255,0.07)",
        borderRadius: 4,
        padding: "1px 5px",
        fontSize: "0.87em",
        fontFamily: "var(--font-mono)",
      }}>
        {children}
      </code>
    );
  }

  const lang    = match[1].toLowerCase();
  const isHtml  = lang === "html";
  const isAscii = lang === "text" || str.includes("■") || str.includes("┌");

  if (isHtml) {
    return (
      <div style={{
        margin: "12px 0",
        border: "1px solid var(--border-m)",
        borderRadius: 12,
        overflow: "hidden",
        background: "var(--bg2)",
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 12px",
          borderBottom: "1px solid var(--border)",
          background: "var(--bg3)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {["#ef4444", "#f59e0b", "#10b981"].map((c, i) => (
              <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: c, opacity: 0.7 }} />
            ))}
            <span style={{ fontSize: 11, color: "var(--text-3)", fontFamily: "var(--font-mono)", marginLeft: 4 }}>
              preview
            </span>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button
              onClick={() => setExpanded(v => !v)}
              style={{ height: 24, padding: "0 10px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, fontSize: 11, color: "var(--text-2)", cursor: "pointer", fontFamily: "var(--font-sans)" }}
            >
              {expanded ? "Collapse" : "Expand"}
            </button>
            <button
              onClick={copy}
              style={{ height: 24, padding: "0 10px", background: done ? "var(--amber-faint)" : "var(--surface)", border: `1px solid ${done ? "var(--amber-border)" : "var(--border)"}`, borderRadius: 6, fontSize: 11, color: done ? "var(--amber)" : "var(--text-2)", cursor: "pointer", transition: "all 0.15s" }}
            >
              {done ? "✓ Copied" : "Copy HTML"}
            </button>
          </div>
        </div>
        <iframe
          srcDoc={ensureHtmlDoc(str)}
          style={{ width: "100%", height: expanded ? 600 : 320, border: "none", display: "block", transition: "height 0.3s ease", background: "#fff" }}
          sandbox="allow-scripts allow-same-origin"
          title="Design preview"
        />
      </div>
    );
  }

  if (isAscii) {
    return (
      <div style={{ position: "relative", margin: "10px 0" }}>
        <pre style={{
          background: "#0d1117",
          border: "1px solid #30363d",
          borderRadius: 10,
          padding: "14px 16px",
          fontFamily: "var(--font-mono)",
          fontSize: 12,
          lineHeight: 1.6,
          whiteSpace: "pre",
          overflowX: "auto",
          color: "#e6edf3",
          margin: 0,
        }}>
          {str}
        </pre>
        <button className="code-copy-btn" onClick={copy}>{done ? "✓" : "Copy"}</button>
      </div>
    );
  }

  return (
    <div style={{ position: "relative", margin: "10px 0" }}>
      <SyntaxHighlighter
        style={oneDark}
        language={lang}
        PreTag="div"
        customStyle={{ borderRadius: 10, fontSize: 12, margin: 0, border: "1px solid rgba(255,255,255,0.07)" }}
      >
        {str}
      </SyntaxHighlighter>
      <button className="code-copy-btn" onClick={copy}>{done ? "✓" : "Copy"}</button>
    </div>
  );
}

// ── Markdown ───────────────────────────────────────────────────────────────

function MD({ content, accent }: { content: string; accent: string }) {
  return (
    <ReactMarkdown components={{
      code: Code,
      h2({ children }) {
        return <h2 style={{ fontSize: 13, fontWeight: 700, color: accent, margin: "16px 0 6px", borderBottom: `1px solid ${accent}28`, paddingBottom: 5 }}>{children}</h2>;
      },
      h3({ children }) {
        return <h3 style={{ fontSize: 12.5, fontWeight: 600, margin: "12px 0 4px", color: "var(--text)" }}>{children}</h3>;
      },
      p({ children }) {
        return <p style={{ margin: "6px 0", lineHeight: 1.68 }}>{children}</p>;
      },
      ul({ children }) {
        return <ul style={{ margin: "6px 0", paddingLeft: 20 }}>{children}</ul>;
      },
      ol({ children }) {
        return <ol style={{ margin: "6px 0", paddingLeft: 20 }}>{children}</ol>;
      },
      li({ children }) {
        return <li style={{ margin: "3px 0", fontSize: 13 }}>{children}</li>;
      },
      strong({ children }) {
        return <strong style={{ color: accent, fontWeight: 600 }}>{children}</strong>;
      },
      blockquote({ children }) {
        return <blockquote style={{ borderLeft: `3px solid ${accent}`, margin: "10px 0", padding: "5px 14px", background: accent + "0d", borderRadius: "0 8px 8px 0" }}>{children}</blockquote>;
      },
      hr() {
        return <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "14px 0" }} />;
      },
      a({ children, href }) {
        return <a href={href} target="_blank" rel="noreferrer" style={{ color: accent, textDecoration: "underline", textDecorationColor: accent + "60" }}>{children}</a>;
      },
    }}>
      {content}
    </ReactMarkdown>
  );
}

// ── Typing dots ────────────────────────────────────────────────────────────

function Dots({ color }: { color: string }) {
  return (
    <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
      {[0, 1, 2].map(i => (
        <div
          key={i}
          style={{
            width: 6, height: 6, borderRadius: "50%", background: color,
            animation: `tpulse 1.2s ease-in-out ${i * 0.2}s infinite`, opacity: 0.7,
          }}
        />
      ))}
      <style>{`@keyframes tpulse{0%,80%,100%{transform:scale(0.6);opacity:0.4}40%{transform:scale(1);opacity:1}}`}</style>
    </div>
  );
}