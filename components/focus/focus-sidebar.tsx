"use client";

import { Flame } from "lucide-react";

export interface SidebarMember {
  id: string;
  name: string;
  image?: string | null;
  online: boolean;
  focusing: boolean;
}

export interface TodayStats {
  sessionCount: number;
  focusMinutes: number;
  streak: number;
}

export interface RecentSession {
  id: string;
  type: "focus" | "short_break" | "long_break";
  durationMinutes: number;
  completed: boolean;
}

interface FocusSidebarProps {
  members: SidebarMember[];
  stats: TodayStats;
  recentSessions: RecentSession[];
  mobile?: boolean;
}

const SESSION_LABEL: Record<string, string> = {
  focus: "Focus",
  short_break: "Break",
  long_break: "Long break",
};

export function FocusSidebar({ members, stats, recentSessions, mobile = false }: FocusSidebarProps) {
  return (
    <aside className={mobile ? "focus-sidebar-mobile" : "focus-sidebar"}>

      {/* Members */}
      <section className="focus-sidebar-section">
        <p className="focus-sidebar-label">Members</p>
        <div className="focus-sidebar-members">
          {members.map((m) => (
            <div key={m.id} className="focus-sidebar-member-row">
              <div className="focus-sidebar-member-left">
                {m.image ? (
                  <img src={m.image} alt={m.name} className="focus-sidebar-avatar" />
                ) : (
                  <div className="focus-sidebar-avatar focus-sidebar-avatar-fallback">
                    {m.name[0].toUpperCase()}
                  </div>
                )}
                <span className="focus-sidebar-member-name">{m.name}</span>
              </div>
              <span className={`focus-sidebar-online-dot${m.online ? " online" : ""}`} />
            </div>
          ))}
        </div>
      </section>

      <div className="focus-sidebar-divider" />

      {/* Today stats */}
      <section className="focus-sidebar-section">
        <p className="focus-sidebar-label">Today</p>
        <div className="focus-sidebar-stats">
          <StatRow label="Sessions"   value={String(stats.sessionCount)} />
          <StatRow label="Focus time" value={`${stats.focusMinutes}m`}   />
          <StatRow label="Streak"     value={String(stats.streak)} icon={<Flame size={13} className="focus-streak-icon" />} />
        </div>
      </section>

      <div className="focus-sidebar-divider" />

      {/* Recent */}
      <section className="focus-sidebar-section">
        <p className="focus-sidebar-label">Recent</p>
        <div className="focus-sidebar-recent">
          {recentSessions.length === 0 && <p className="focus-sidebar-empty">No sessions yet today</p>}
          {recentSessions.map((s) => (
            <div key={s.id} className="focus-recent-item">
              <div className="focus-recent-item-left">
                <div className={`focus-recent-checkbox${s.completed ? " completed" : ""}`} />
                <span className="focus-recent-label">{SESSION_LABEL[s.type]}</span>
              </div>
              <span className="focus-recent-duration">{s.durationMinutes}m</span>
            </div>
          ))}
        </div>
      </section>
    </aside>
  );
}

function StatRow({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="focus-stat-row">
      <span className="focus-stat-label">{label}</span>
      <div className="focus-stat-value-row">{icon}<span className="focus-stat-value">{value}</span></div>
    </div>
  );
}