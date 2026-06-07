"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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

// ── Meta ───────────────────────────────────────────────────────────────────

const AGENT_META: Record<string, { accent: string; label: string; tagline: string }> = {
  codebuddy:    { accent: "#10b981", label: "CodeBuddy",    tagline: "Error solver · Bug finder · Code improver" },
  clarityagent: { accent: "#6366f1", label: "ClarityAgent", tagline: "Complex task → clear step-by-step plan" },
  researchbot:  { accent: "#D97706", label: "ResearchBot",  tagline: "Live web search · Structured research reports" },
  designexpert: { accent: "#ec4899", label: "DesignExpert", tagline: "UI design · ASCII wireframes · Visual guidance" },
  docwriter:    { accent: "#3b82f6", label: "DocWriter",    tagline: "JSDoc comments · Full project README" },
};

const PLACEHOLDERS: Record<string, string> = {
  codebuddy:    "Paste code or describe a bug… (Shift+Enter for new line)",
  clarityagent: "Describe a complex task you need to plan…",
  researchbot:  "Ask a research question…",
  designexpert: "Describe your UI or design problem…",
  docwriter:    "Paste code to document, or describe your project…",
};

function agentIconPath(agentName: string): string {
  return ({ codebuddy: P.code, clarityagent: P.chat, researchbot: P.search, designexpert: P.star, docwriter: P.book } as Record<string, string>)[agentName] ?? P.zap;
}

// ── localStorage (only for model + active session ID) ─────────────────────
const lsModel  = (a: string) => `studiosynq:agent:${a}:model`;
const lsActive = (a: string) => `studiosynq:agent:${a}:active`;

function readModel(a: string): ModelId {
  if (typeof window === "undefined") return DEFAULT_MODEL_ID;
  const v = localStorage.getItem(lsModel(a));
  return ALL_MODELS.find(m => m.id === v)?.id ?? DEFAULT_MODEL_ID;
}
function writeModel(a: string, id: ModelId) {
  try { localStorage.setItem(lsModel(a), id); } catch { /* quota */ }
}
function readActiveId(a: string): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(lsActive(a));
}
function writeActiveId(a: string, id: string) {
  try { localStorage.setItem(lsActive(a), id); } catch { /* quota */ }
}

function titleFrom(msgs: Message[]): string {
  const u = msgs.find(m => m.role === "user");
  if (!u) return "New chat";
  return u.content.slice(0, 40) + (u.content.length > 40 ? "…" : "");
}

// ── Component ──────────────────────────────────────────────────────────────

export function AgentChatPanel({ agentName, sessionContext }: Props) {
  const meta = AGENT_META[agentName] ?? { accent: "#10b981", label: agentName, tagline: "" };
  const isResearch = agentName === "researchbot";
  const queryClient = useQueryClient();

  const [activeId, setActiveId] = useState<string | null>(null);
  const [histOpen, setHistOpen] = useState(false);
  const [modelOpen, setModelOpen] = useState(false);
  const [modelId, setModelId] = useState<ModelId>(DEFAULT_MODEL_ID);
  const [mounted, setMounted] = useState(false);

  // ── Fetch sessions from DB ────────────────────────────────────────────────
  const { data: sessions = [], isLoading: sessionsLoading } = useQuery<ChatSession[]>({
    queryKey: ["agent-sessions", agentName],
    queryFn: () => fetch(`/api/agent-sessions/${agentName}`).then(r => r.json()),
    enabled: mounted,
  });

  // ── Mutations ─────────────────────────────────────────────────────────────
  const createSession = useMutation({
    mutationFn: async (data: { title: string; messages: Message[] }) => {
      const res = await fetch(`/api/agent-sessions/${agentName}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return res.json() as Promise<ChatSession>;
    },
    onSuccess: (newSession) => {
      queryClient.setQueryData<ChatSession[]>(["agent-sessions", agentName], old =>
        [newSession, ...(old ?? [])]
      );
      setActiveId(newSession.id);
      writeActiveId(agentName, newSession.id);
    },
  });

  const updateSession = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { title?: string; messages?: Message[] } }) => {
      const res = await fetch(`/api/agent-sessions/${agentName}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return res.json() as Promise<ChatSession>;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData<ChatSession[]>(["agent-sessions", agentName], old =>
        old?.map(s => s.id === updated.id ? updated : s) ?? []
      );
    },
  });

  const deleteSession = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/agent-sessions/${agentName}/${id}`, { method: "DELETE" });
      return id;
    },
    onSuccess: (deletedId) => {
      queryClient.setQueryData<ChatSession[]>(["agent-sessions", agentName], old => {
        const next = old?.filter(s => s.id !== deletedId) ?? [];
        if (activeId === deletedId) {
          const newActive = next[0]?.id ?? null;
          setActiveId(newActive);
          if (newActive) writeActiveId(agentName, newActive);
        }
        return next;
      });
    },
  });

  // ── On mount: restore model + active session ──────────────────────────────
  useEffect(() => {
    setModelId(readModel(agentName));
    setMounted(true);
  }, [agentName]);

  // Once sessions load, restore or create initial session
  useEffect(() => {
    if (!mounted || sessionsLoading) return;
    if (sessions.length === 0) {
      createSession.mutate({ title: "New chat", messages: [] });
    } else {
      const savedId = readActiveId(agentName);
      const valid = savedId && sessions.find(s => s.id === savedId);
      setActiveId(valid ? savedId : sessions[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, sessionsLoading]);

  const activeSession = sessions.find(s => s.id === activeId) ?? null;
  const currentModel = ALL_MODELS.find(m => m.id === modelId) ?? ALL_MODELS[2];

  function selectModel(id: ModelId) {
    setModelId(id);
    writeModel(agentName, id);
    setModelOpen(false);
  }

  function newChat() {
    createSession.mutate({ title: "New chat", messages: [] });
    setHistOpen(false);
    setResInput("");
    setChatInput("");
  }

  function pickSession(id: string) {
    setActiveId(id);
    writeActiveId(agentName, id);
    setHistOpen(false);
  }

  function dropSession(id: string) {
    deleteSession.mutate(id);
  }

  function patchMessages(messages: Message[], title?: string) {
    if (!activeId) return;
    updateSession.mutate({
      id: activeId,
      data: {
        messages,
        ...(title !== undefined && { title }),
      },
    });
  }

  // ── ResearchBot ───────────────────────────────────────────────────────────
  const [resInput, setResInput] = useState("");
  const [resLoading, setResLoading] = useState(false);
  const [resError, setResError] = useState<string | null>(null);
  const [webUsed, setWebUsed] = useState(false);
  const resMessages = activeSession?.messages ?? [];

  async function submitResearch(e: React.FormEvent) {
    e.preventDefault();
    const msg = resInput.trim();
    if (!msg || resLoading || !activeSession) return;
    setResInput("");
    setResError(null);
    setWebUsed(false);

    const userMsg: Message = { role: "user", content: msg, id: crypto.randomUUID() };
    const updated = [...activeSession.messages, userMsg];
    const newTitle = activeSession.messages.length === 0 ? titleFrom([userMsg]) : activeSession.title;
    patchMessages(updated, newTitle);

    setResLoading(true);
    try {
      const history = activeSession.messages.map(m => ({ role: m.role, content: m.content }));
      const res = await fetch(`/api/agents/${agentName}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, history, modelId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Request failed");
      if (data.webSearch) setWebUsed(true);
      const asst: Message = { role: "assistant", content: data.text, id: crypto.randomUUID() };
      patchMessages([...updated, asst]);
    } catch (err) {
      setResError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setResLoading(false);
    }
  }

  // ── Streaming ─────────────────────────────────────────────────────────────
  const [chatInput, setChatInput] = useState("");

  const { messages: sdkMsgs, sendMessage, status, error, setMessages } = useChat({
    transport: new DefaultChatTransport({
      api: `/api/agents/${agentName}`,
      prepareSendMessagesRequest({ messages }) {
        return { body: { messages, modelId, ...(sessionContext ?? {}) } };
      },
    }),
  });

  const isStreaming = status === "streaming" || status === "submitted";

  const chatMsgs: Message[] = sdkMsgs.map(m => ({
    role: m.role as "user" | "assistant",
    content: (m.parts ?? [])
      .filter((p): p is { type: "text"; text: string } => p.type === "text" && typeof (p as { text?: string }).text === "string")
      .map(p => p.text).join(""),
    id: m.id,
  }));

  // Save to DB when streaming finishes
  useEffect(() => {
    if (isStreaming || !activeId || isResearch || chatMsgs.length === 0) return;
    const newTitle = activeSession?.title === "New chat" ? titleFrom(chatMsgs) : activeSession?.title;
    patchMessages(chatMsgs, newTitle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStreaming, chatMsgs.length]);

  // Restore SDK messages when switching sessions
  useEffect(() => {
    if (isResearch || !activeSession || !mounted) return;
    const nextMessages = activeSession.messages.map(m => ({
      id: m.id, role: m.role, content: m.content,
      parts: [{ type: "text" as const, text: m.content }],
    }));
    setMessages(nextMessages);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId, mounted]);

  async function submitChat(e: React.FormEvent) {
    e.preventDefault();
    const msg = chatInput.trim();
    if (!msg || isStreaming) return;
    setChatInput("");
    await sendMessage({ text: msg });
  }

  function onKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      isResearch ? submitResearch(e as unknown as React.FormEvent) : submitChat(e as unknown as React.FormEvent);
    }
  }

  const msgs = isResearch ? resMessages : chatMsgs;
  const loading = isResearch ? resLoading : isStreaming;
  const errMsg = isResearch ? resError : (error?.message ?? null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs.length, loading]);

  function autoResize(el: HTMLTextAreaElement | null) {
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  }

  const inputVal = isResearch ? resInput : chatInput;
  const setInput = useCallback((v: string) => {
    isResearch ? setResInput(v) : setChatInput(v);
  }, [isResearch]);

  const modelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (modelRef.current && !modelRef.current.contains(e.target as Node)) setModelOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!mounted) return null;

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
          >+ New</button>
        </div>
        <div className="agent-sidebar-list">
          {sessionsLoading ? (
            <p style={{ fontSize: 11, color: "var(--text-3)", padding: "8px 10px" }}>Loading…</p>
          ) : (
            sessions.map(s => (
              <div
                key={s.id}
                className={`agent-session-item${s.id === activeId ? " active" : ""}`}
                onClick={() => pickSession(s.id)}
              >
                <span className="agent-session-title">{s.title}</span>
                <button
                  className="agent-session-del"
                  onClick={e => { e.stopPropagation(); dropSession(s.id); }}
                >✕</button>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="agent-main">
        {/* Header */}
        <div className="agent-header">
          <button className={`agent-header-toggle${histOpen ? " active" : ""}`} onClick={() => setHistOpen(v => !v)} title="Chat history">
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
            <div className="agent-model-picker" ref={modelRef}>
              <button className="agent-model-trigger" onClick={() => setModelOpen(v => !v)} title="Choose model">
                <span className="agent-model-dot" style={{ background: currentModel.badgeColor }} />
                <span className="agent-model-name">{currentModel.label}</span>
                <span className="agent-model-caret">▾</span>
              </button>
              {modelOpen && (
                <div className="agent-model-dropdown">
                  <div className="agent-model-dropdown-head">Choose model</div>
                  {(["groq", "gemini", "mistral"] as const).map(provider => {
                    const providerModels = ALL_MODELS.filter(m => m.provider === provider);
                    const providerMeta = providerModels[0];
                    return (
                      <div key={provider}>
                        <div className="agent-model-provider-label" style={{ color: providerMeta.providerColor }}>
                          {providerMeta.providerLabel}
                        </div>
                        {providerModels.map((m: ModelOption) => (
                          <button
                            key={m.id}
                            className={`agent-model-option${m.id === modelId ? " selected" : ""}`}
                            onClick={() => selectModel(m.id)}
                          >
                            <div className="agent-model-option-top">
                              <span className="agent-model-option-label">{m.label}</span>
                              <span className="agent-model-option-badge" style={{ background: m.badgeColor + "20", color: m.badgeColor }}>
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
            <button className="agent-new-btn" onClick={newChat}>+ <span>New chat</span></button>
          </div>
        </div>

        {/* Messages */}
        <div className="agent-messages">
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
                style={msg.role === "user" ? { background: meta.accent + "1a", border: `1px solid ${meta.accent}38` } : undefined}
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
                      {process.env.NEXT_PUBLIC_TAVILY_ENABLED === "true" ? "Searching the web…" : "Searching knowledge base…"}
                    </span>
                  </>
                ) : <Dots color={meta.accent} />}
              </div>
            </div>
          )}

          {errMsg && <div className="agent-error">{errMsg}</div>}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="agent-input-area">
          <form onSubmit={isResearch ? submitResearch : submitChat} className="agent-input-box">
            <textarea
              ref={textareaRef}
              value={inputVal}
              rows={1}
              disabled={loading}
              placeholder={PLACEHOLDERS[agentName] ?? "Ask anything…"}
              className="agent-textarea"
              onChange={e => { setInput(e.target.value); autoResize(e.target); }}
              onKeyDown={onKey}
            />
            <button
              type="submit"
              disabled={loading || !inputVal.trim()}
              className="agent-send-btn"
              style={{
                background: loading || !inputVal.trim() ? "var(--surface)" : meta.accent,
                color: loading || !inputVal.trim() ? "var(--text-3)" : "#fff",
              }}
            >
              <Ico d={P.chevR} size={16} stroke="currentColor" />
            </button>
          </form>
          <p className="agent-input-footer">AI can make mistakes — always verify important responses</p>
        </div>
      </div>
    </div>
  );
}

// ── Copy button ──────────────────────────────────────────────────────────────
function CopyBtn({ text, accent }: { text: string; accent: string }) {
  const [done, setDone] = useState(false);
  async function copy() {
    try { await navigator.clipboard.writeText(text); }
    catch {
      const el = document.createElement("textarea");
      el.value = text; document.body.appendChild(el); el.select();
      document.execCommand("copy"); document.body.removeChild(el);
    }
    setDone(true); setTimeout(() => setDone(false), 2000);
  }
  return <button className="agent-msg-copy" onClick={copy} style={{ color: done ? accent : "var(--text-3)" }}>{done ? "✓ Copied" : "Copy"}</button>;
}

// ── Code block ───────────────────────────────────────────────────────────────
function Code({ className, children }: { className?: string; children?: React.ReactNode }) {
  const match = /language-(\w+)/.exec(className || "");
  const str = String(children).replace(/\n$/, "");
  const [done, setDone] = useState(false);
  async function copy() { await navigator.clipboard.writeText(str); setDone(true); setTimeout(() => setDone(false), 2000); }
  if (!match) return <code style={{ background: "rgba(255,255,255,0.07)", borderRadius: 4, padding: "1px 5px", fontSize: "0.87em", fontFamily: "var(--font-mono)" }}>{children}</code>;
  const isAscii = match[1] === "text" || str.includes("■") || str.includes("┌");
  return (
    <div style={{ position: "relative", margin: "10px 0" }}>
      {isAscii ? (
        <pre style={{ background: "#0d1117", border: "1px solid #30363d", borderRadius: 10, padding: "14px 16px", fontFamily: "var(--font-mono)", fontSize: 12, lineHeight: 1.6, whiteSpace: "pre", overflowX: "auto", color: "#e6edf3", margin: 0 }}>{str}</pre>
      ) : (
        <SyntaxHighlighter style={oneDark} language={match[1]} PreTag="div" customStyle={{ borderRadius: 10, fontSize: 12, margin: 0, border: "1px solid rgba(255,255,255,0.07)" }}>{str}</SyntaxHighlighter>
      )}
      <button className="code-copy-btn" onClick={copy}>{done ? "✓" : "Copy"}</button>
    </div>
  );
}

// ── Markdown ─────────────────────────────────────────────────────────────────
function MD({ content, accent }: { content: string; accent: string }) {
  return (
    <ReactMarkdown components={{
      code: Code,
      h2({ children }) { return <h2 style={{ fontSize: 13, fontWeight: 700, color: accent, margin: "16px 0 6px", borderBottom: `1px solid ${accent}28`, paddingBottom: 5 }}>{children}</h2>; },
      h3({ children }) { return <h3 style={{ fontSize: 12.5, fontWeight: 600, margin: "12px 0 4px", color: "var(--text)" }}>{children}</h3>; },
      p({ children }) { return <p style={{ margin: "6px 0", lineHeight: 1.68 }}>{children}</p>; },
      ul({ children }) { return <ul style={{ margin: "6px 0", paddingLeft: 20 }}>{children}</ul>; },
      ol({ children }) { return <ol style={{ margin: "6px 0", paddingLeft: 20 }}>{children}</ol>; },
      li({ children }) { return <li style={{ margin: "3px 0", fontSize: 13 }}>{children}</li>; },
      strong({ children }) { return <strong style={{ color: accent, fontWeight: 600 }}>{children}</strong>; },
      blockquote({ children }) { return <blockquote style={{ borderLeft: `3px solid ${accent}`, margin: "10px 0", padding: "5px 14px", background: accent + "0d", borderRadius: "0 8px 8px 0" }}>{children}</blockquote>; },
      hr() { return <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "14px 0" }} />; },
      a({ children, href }) { return <a href={href} target="_blank" rel="noreferrer" style={{ color: accent, textDecoration: "underline", textDecorationColor: accent + "60" }}>{children}</a>; },
    }}>{content}</ReactMarkdown>
  );
}

// ── Thinking dots ─────────────────────────────────────────────────────────────
function Dots({ color }: { color: string }) {
  return (
    <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: color, animation: `tpulse 1.2s ease-in-out ${i * 0.2}s infinite`, opacity: 0.7 }} />
      ))}
      <style>{`@keyframes tpulse{0%,80%,100%{transform:scale(0.6);opacity:0.4}40%{transform:scale(1);opacity:1}}`}</style>
    </div>
  );
}