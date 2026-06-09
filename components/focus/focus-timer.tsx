"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { RotateCcw, Pause, Play, SkipForward, ChevronDown, Users, BarChart2, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import Pusher from "pusher-js";
import { FocusSidebar, SidebarMember, TodayStats, RecentSession } from "./focus-sidebar";

// ─── Types ────────────────────────────────────────────────────────────────────

type SessionType = "focus" | "short_break" | "long_break";

interface Mode { type: SessionType; label: string; minutes: number; }

export interface RoomOption { id: string; name: string; }

interface FocusTimerProps {
  roomId: string;
  roomName: string;
  rooms: RoomOption[];
  currentUserId: string;
  currentUserName: string;
  initialMembers: SidebarMember[];
  initialStats: TodayStats;
  initialRecent: RecentSession[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MODES: Mode[] = [
  { type: "focus",       label: "Focus 25m",     minutes: 25 },
  { type: "short_break", label: "Short break 5m", minutes: 5  },
  { type: "long_break",  label: "Long break 15m", minutes: 15 },
];

const TOTAL_POMODOROS = 4;

const SESSION_SEQUENCE: SessionType[] = [
  "focus", "short_break",
  "focus", "short_break",
  "focus", "short_break",
  "focus", "long_break",
];

function getModeByType(t: SessionType): Mode { return MODES.find((m) => m.type === t)!; }

// ─── Audio ────────────────────────────────────────────────────────────────────

function playBell(type: "focus_done" | "break_done") {
  try {
    const ctx = new AudioContext();
    const beep = (freq: number, start: number, dur: number, gain: number) => {
      const osc = ctx.createOscillator();
      const g   = ctx.createGain();
      osc.connect(g); g.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
      g.gain.setValueAtTime(0, ctx.currentTime + start);
      g.gain.linearRampToValueAtTime(gain, ctx.currentTime + start + 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + dur);
    };
    if (type === "focus_done") { beep(523,0,0.3,0.4); beep(659,0.2,0.3,0.4); beep(784,0.4,0.5,0.4); }
    else                       { beep(659,0,0.3,0.35); beep(523,0.25,0.4,0.35); }
  } catch {}
}

function sendNotification(title: string, body: string) {
  if (typeof window === "undefined" || Notification.permission !== "granted") return;
  new Notification(title, { body, icon: "/studiosynq-logo.jpg", silent: true });
}

// ─── Ring color ───────────────────────────────────────────────────────────────

function ringColor(mode: SessionType) {
  if (mode === "focus")       return "var(--amber)";
  if (mode === "short_break") return "#60a5fa";
  return "#a78bfa";
}

// ─── Progress Ring ────────────────────────────────────────────────────────────

function ProgressRing({ progress, isRunning, mode, size = 260 }: { progress: number; isRunning: boolean; mode: SessionType; size?: number }) {
  const STROKE = 6;
  const RADIUS = (size - STROKE * 2) / 2;
  const CIRC   = 2 * Math.PI * RADIUS;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="focus-ring-svg">
      <circle cx={size/2} cy={size/2} r={RADIUS} fill="none" stroke="var(--bg3)" strokeWidth={STROKE} />
      <circle
        cx={size/2} cy={size/2} r={RADIUS} fill="none"
        stroke={ringColor(mode)} strokeWidth={STROKE}
        strokeDasharray={CIRC} strokeDashoffset={CIRC * (1 - progress)}
        strokeLinecap="round"
        style={{ transition: isRunning ? "stroke-dashoffset 1s linear" : "stroke-dashoffset 0.3s ease" }}
      />
    </svg>
  );
}

// ─── Session Dots ─────────────────────────────────────────────────────────────

function SessionDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="focus-session-dots">
      {Array.from({ length: total }).map((_, i) => (
        <span key={i} className="focus-session-dot" style={{
          width:      i < current ? "10px" : "7px",
          height:     i < current ? "10px" : "7px",
          background: i < current ? "var(--amber)" : "var(--bg4)",
          opacity:    i < current ? 1 : 0.35,
        }} />
      ))}
    </div>
  );
}

// ─── Room Switcher ────────────────────────────────────────────────────────────

function RoomSwitcher({ rooms, currentId, currentName }: { rooms: RoomOption[]; currentId: string; currentName: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (rooms.length <= 1) return (
    <span className="focus-room-name">{currentName}</span>
  );

  return (
    <div className="focus-room-switcher" ref={ref}>
      <button className="focus-room-trigger" onClick={() => setOpen(v => !v)}>
        <span className="focus-room-name">{currentName}</span>
        <ChevronDown size={13} className={`focus-room-caret${open ? " open" : ""}`} />
      </button>
      {open && (
        <div className="focus-room-dropdown">
          <p className="focus-room-dropdown-label">Switch room</p>
          {rooms.map((r) => (
            <button
              key={r.id}
              className={`focus-room-option${r.id === currentId ? " active" : ""}`}
              onClick={() => { router.push(`/focus?roomId=${r.id}`); setOpen(false); }}
            >
              {r.name}
              {r.id === currentId && <span className="focus-room-active-dot" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Mobile Stats Sheet ───────────────────────────────────────────────────────

function MobileStatsSheet({
  open, onClose, members, stats, recentSessions,
}: {
  open: boolean;
  onClose: () => void;
  members: SidebarMember[];
  stats: TodayStats;
  recentSessions: RecentSession[];
}) {
  if (!open) return null;
  return (
    <>
      <div className="focus-sheet-backdrop" onClick={onClose} />
      <div className="focus-sheet">
        <div className="focus-sheet-handle" />
        <FocusSidebar members={members} stats={stats} recentSessions={recentSessions} mobile />
      </div>
    </>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function FocusTimer({
  roomId, roomName, rooms,
  currentUserId,
  initialMembers, initialStats, initialRecent,
}: FocusTimerProps) {
  const [mode,           setMode]           = useState<SessionType>("focus");
  const [secondsLeft,    setSecondsLeft]    = useState(25 * 60);
  const [isRunning,      setIsRunning]      = useState(false);
  const [sessionIndex,   setSessionIndex]   = useState(0);
  const [stats,          setStats]          = useState<TodayStats>(initialStats);
  const [recentSessions, setRecentSessions] = useState<RecentSession[]>(initialRecent);
  const [members,        setMembers]        = useState<SidebarMember[]>(initialMembers);
  const [sheetOpen,      setSheetOpen]      = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pusherRef   = useRef<Pusher | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const totalSeconds       = getModeByType(mode).minutes * 60;
  const progress           = secondsLeft / totalSeconds;
  const focusSessionNumber = Math.min(
    SESSION_SEQUENCE.slice(0, sessionIndex + 1).filter(s => s === "focus").length,
    TOTAL_POMODOROS
  );
  const overallProgress = Math.round(((sessionIndex % 8) / 8) * 100);
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");
  const modeLabel = mode === "focus" ? "Focus session" : mode === "short_break" ? "Short break" : "Long break";

  // ── Sync members + stats when roomId prop changes (room switcher) ──────────
  useEffect(() => {
    // Reset to initial props on first render — skip
    // On subsequent renders (room switch), fetch fresh data
    let cancelled = false;

    async function fetchRoomData() {
      try {
        // Members
        const membersRes = await fetch(`/api/rooms/${roomId}/members`);
        if (!membersRes.ok) return;
        const { members: fresh } = await membersRes.json();
        if (!cancelled) {
          setMembers(fresh.map((m: { id: string; name: string; image: string | null }) => ({
            id: m.id, name: m.name, image: m.image, online: false, focusing: false,
          })));
        }

        // Today's stats for this room
        const statsRes = await fetch(`/api/focus-sessions?roomId=${roomId}`);
        if (!statsRes.ok) return;
        const { stats: freshStats, sessions: freshSessions } = await statsRes.json();
        if (!cancelled) {
          setStats(freshStats);
          setRecentSessions(
            freshSessions.slice(0, 10).map((s: { id: string; type: string; durationMinutes: number; completed: boolean }) => ({
              id: s.id, type: s.type, durationMinutes: s.durationMinutes, completed: s.completed,
            }))
          );
        }
      } catch {}
    }

    fetchRoomData();
    return () => { cancelled = true; };
  }, [roomId]);

  // ── Pusher ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_PUSHER_KEY) return;
    pusherRef.current = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? "ap2",
    });
    const ch = pusherRef.current.subscribe(`focus-${roomId}`);
    ch.bind("focus:state", (data: { userId: string; isRunning: boolean; mode: SessionType }) => {
      if (data.userId === currentUserId) return;
      setMembers(prev => prev.map(m => m.id === data.userId ? { ...m, online: true, focusing: data.isRunning } : m));
    });
    return () => { ch.unbind_all(); pusherRef.current?.unsubscribe(`focus-${roomId}`); pusherRef.current?.disconnect(); };
  }, [roomId, currentUserId]);

  // ── Broadcast ─────────────────────────────────────────────────────────────
  const broadcastState = useCallback(async (running: boolean, m: SessionType) => {
    try {
      await fetch(`/api/rooms/${roomId}/focus-broadcast`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRunning: running, mode: m }),
      });
    } catch {}
  }, [roomId]);

  // ── Session complete ──────────────────────────────────────────────────────
  const handleSessionComplete = useCallback(async () => {
    setIsRunning(false);
    const completedMode     = SESSION_SEQUENCE[sessionIndex % SESSION_SEQUENCE.length];
    const completedDuration = getModeByType(completedMode).minutes;

    if (completedMode === "focus") {
      playBell("focus_done");
      sendNotification("Focus session complete!", "Great work. Time for a break.");
    } else {
      playBell("break_done");
      sendNotification("Break over!", "Time to focus again.");
    }

    try {
      await fetch("/api/focus-sessions", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, type: completedMode, durationMinutes: completedDuration, completed: true }),
      });
    } catch {}

    if (completedMode === "focus") {
      setStats(prev => ({ sessionCount: prev.sessionCount + 1, focusMinutes: prev.focusMinutes + completedDuration, streak: prev.streak + 1 }));
    }
    setRecentSessions(prev =>
      [{ id: `${Date.now()}`, type: completedMode, durationMinutes: completedDuration, completed: true }, ...prev].slice(0, 10)
    );

    const nextIndex = sessionIndex + 1;
    setSessionIndex(nextIndex);
    const nextMode = SESSION_SEQUENCE[nextIndex % SESSION_SEQUENCE.length];
    setMode(nextMode);
    setSecondsLeft(getModeByType(nextMode).minutes * 60);
  }, [sessionIndex, roomId]);

  // ── Tick ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft(prev => {
          if (prev <= 1) { clearInterval(intervalRef.current!); handleSessionComplete(); return 0; }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, handleSessionComplete]);

  // ── Controls ──────────────────────────────────────────────────────────────
  const handlePlayPause = () => { const n = !isRunning; setIsRunning(n); broadcastState(n, mode); };
  const handleReset     = () => { setIsRunning(false); setSecondsLeft(getModeByType(mode).minutes * 60); broadcastState(false, mode); };
  const handleSkip      = () => {
    setIsRunning(false);
    const ni = sessionIndex + 1; setSessionIndex(ni);
    const nm = SESSION_SEQUENCE[ni % SESSION_SEQUENCE.length];
    setMode(nm); setSecondsLeft(getModeByType(nm).minutes * 60);
    broadcastState(false, nm);
  };
  const handleModeSwitch = (m: Mode) => {
    setIsRunning(false); setMode(m.type); setSecondsLeft(m.minutes * 60);
    const idx = SESSION_SEQUENCE.indexOf(m.type);
    if (idx !== -1) setSessionIndex(idx);
    broadcastState(false, m.type);
  };

  const focusingCount = members.filter(m => m.focusing).length + 1;
  const color         = ringColor(mode);

  return (
    <div className="focus-page-inner">

      {/* ── Sub-header: room switcher (client-rendered, replaces server title) ── */}
      <div className="focus-subheader">
        <div className="focus-subheader-left">
          <RoomSwitcher rooms={rooms} currentId={roomId} currentName={roomName} />
          <span className="focus-subheader-sep">—</span>
          <span className="focus-subheader-section">Focus</span>
        </div>
        <div className="focus-live-pill-inline">
          <span className="focus-live-dot" style={{ background: isRunning ? "var(--amber)" : "var(--text-3)", boxShadow: isRunning ? "0 0 6px var(--amber)" : "none" }} />
          <span className="focus-live-label">{isRunning ? "Live" : "Idle"}</span>
          {focusingCount > 0 && <span className="focus-focusing-count">{focusingCount} focusing</span>}
        </div>
      </div>

      {/* ── Shell: timer + sidebar ── */}
      <div className="focus-shell">

        {/* Main area */}
        <div className="focus-main">

          {/* Mode tabs */}
          <div className="focus-mode-tabs">
            {MODES.map(m => (
              <button key={m.type} onClick={() => handleModeSwitch(m)} className={`focus-mode-tab${mode === m.type ? " active" : ""}`}>
                {m.label}
              </button>
            ))}
          </div>

          {/* Ring */}
          <div className="focus-ring-wrap">
            <ProgressRing progress={progress} isRunning={isRunning} mode={mode} size={260} />
            <div className="focus-ring-center">
              <span className="focus-time">{mm} : {ss}</span>
              <span className="focus-mode-label">{modeLabel}</span>
              <SessionDots current={focusSessionNumber} total={TOTAL_POMODOROS} />
            </div>
          </div>

          {/* Controls */}
          <div className="focus-controls">
            <button onClick={handleReset}     className="focus-ctrl-btn"><RotateCcw size={15} />Reset</button>
            <button onClick={handlePlayPause} className={`focus-ctrl-btn${!isRunning ? " primary" : ""}`}>
              {isRunning ? <Pause size={15} /> : <Play size={15} />}
              {isRunning ? "Pause" : "Start"}
            </button>
            <button onClick={handleSkip}      className="focus-ctrl-btn"><SkipForward size={15} />Skip</button>
          </div>

          {/* Progress bar */}
          <div className="focus-progress-wrap">
            <div className="focus-progress-meta">
              <span className="focus-progress-label">Session {Math.min(focusSessionNumber, TOTAL_POMODOROS)} of {TOTAL_POMODOROS}</span>
              <span className="focus-progress-pct">{overallProgress}%</span>
            </div>
            <div className="focus-progress-track">
              <div className="focus-progress-fill" style={{ width: `${overallProgress}%`, background: color }} />
            </div>
          </div>

          {/* How it works */}
          <div className="focus-how-it-works">
            <div className="focus-how-step">
              <span className="focus-how-dot focus" />
              <span className="focus-how-text"><strong>25 min</strong> focus session</span>
            </div>
            <span className="focus-how-arrow">→</span>
            <div className="focus-how-step">
              <span className="focus-how-dot short" />
              <span className="focus-how-text"><strong>5 min</strong> short break</span>
            </div>
            <span className="focus-how-arrow">→</span>
            <div className="focus-how-step focus-how-repeat">
              <span className="focus-how-text">repeat ×4</span>
            </div>
            <span className="focus-how-arrow">→</span>
            <div className="focus-how-step">
              <span className="focus-how-dot long" />
              <span className="focus-how-text"><strong>15 min</strong> long break</span>
            </div>
          </div>
        </div>

        {/* Desktop sidebar */}
        <FocusSidebar members={members} stats={stats} recentSessions={recentSessions} />
      </div>

      {/* Mobile bottom bar — outside shell, fixed to viewport bottom */}
      <div className="focus-mobile-bar">
        <div className="focus-mobile-stats">
          <span className="focus-mobile-stat"><Clock size={12} />{stats.focusMinutes}m today</span>
          <span className="focus-mobile-stat"><BarChart2 size={12} />{stats.sessionCount} sessions</span>
        </div>
        <button className="focus-mobile-sheet-btn" onClick={() => setSheetOpen(true)}>
          <Users size={14} />
          <span>Details</span>
        </button>
      </div>

      {/* Mobile bottom sheet */}
      <MobileStatsSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        members={members}
        stats={stats}
        recentSessions={recentSessions}
      />
    </div>
  );
}