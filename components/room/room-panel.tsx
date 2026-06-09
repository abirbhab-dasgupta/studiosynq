"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Ico, P } from "@/components/dashboard/icons";
import { MemberProfileModal } from "@/components/shared/member-profile-modal";
import Image from "next/image";

type Member = {
    userId: string;
    name: string;
    image: string | null;
    avatarColor: string | null;
    joinedAt: string;
};

type Props = {
    roomId: string;
    members: Member[];
    currentUserId: string;
    isOwner: boolean;
    onAgentClick: (slug: string) => void;
    onLeave: () => void;
    onClose?: () => void;
};

const AGENTS = [
    { name: "CodeBuddy",    slug: "codebuddy",    color: "#10b981" },
    { name: "ClarityAgent", slug: "clarityagent", color: "#6366f1" },
    { name: "ResearchBot",  slug: "researchbot",  color: "#D97706" },
    { name: "DesignExpert", slug: "designexpert", color: "#ec4899" },
    { name: "DocWriter",    slug: "docwriter",    color: "#3b82f6" },
];

export function RightPanel({
    roomId, members, currentUserId, isOwner, onAgentClick, onLeave, onClose,
}: Props) {
    const router = useRouter();
    const [activeUserId, setActiveUserId] = useState<string | null>(null);

    return (
        <>
            <div className="room-right-panel">
                {/* Close button */}
                <div className="room-right-panel-close-row">
                    <span className="room-right-label" style={{ padding: 0 }}>Panel</span>
                    {onClose && (
                        <button
                            onClick={onClose}
                            style={{
                                width: 26, height: 26, borderRadius: 6,
                                background: "var(--surface)",
                                border: "1px solid var(--border)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                cursor: "pointer",
                            }}
                            title="Close panel"
                        >
                            <svg width={12} height={12} viewBox="0 0 24 24" fill="none"
                                stroke="var(--text-2)" strokeWidth="2.5" strokeLinecap="round">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    )}
                </div>

                {/* Members */}
                <div className="room-right-section">
                    <p className="room-right-label">Members</p>
                    {members.map(m => {
                        const initials = m.name.charAt(0).toUpperCase();
                        const isYou = m.userId === currentUserId;
                        return (
                            <button
                                key={m.userId}
                                className="room-right-member-row"
                                onClick={() => setActiveUserId(m.userId)}
                                style={{ width: "100%", background: "transparent", border: "none", cursor: "pointer", borderRadius: 7, transition: "background 0.12s" }}
                                onMouseEnter={e => (e.currentTarget.style.background = "var(--surface-h)")}
                                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                                title={`View ${m.name}'s profile`}
                            >
                                <div style={{
                                    width: 24, height: 24, borderRadius: "50%",
                                    background: m.avatarColor ?? "var(--amber-faint)",
                                    border: "1px solid var(--border-m)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: 10, fontWeight: 600, color: "#fff",
                                    fontFamily: "var(--font-mono)", flexShrink: 0,
                                    overflow: "hidden",
                                }}>
                                    {m.image ? (
                                        <Image src={m.image} alt={m.name}
                                            width={24} height={24}
                                            style={{ objectFit: "cover", borderRadius: "50%" }}
                                        />
                                    ) : initials}
                                </div>
                                <span className="room-right-member-name">
                                    {m.name}
                                    {isYou && (
                                        <span style={{
                                            fontSize: 9, color: "var(--text-3)",
                                            fontFamily: "var(--font-mono)", marginLeft: 4,
                                        }}>you</span>
                                    )}
                                </span>
                                <div className="room-right-online-dot" />
                            </button>
                        );
                    })}
                </div>

                <div className="room-right-divider" />

                {/* Agents */}
                <div className="room-right-section">
                    <p className="room-right-label">Call an agent</p>
                    <p className="room-right-hint">
                        Type{" "}
                        <span style={{ fontFamily: "var(--font-mono)", color: "var(--amber)" }}>
                            @AgentName
                        </span>{" "}
                        in chat
                    </p>
                    {AGENTS.map(agent => (
                        <button
                            key={agent.slug}
                            className="room-right-agent-row"
                            onClick={() => onAgentClick(agent.slug)}
                            title={`Insert @${agent.name}`}
                        >
                            <div style={{
                                width: 7, height: 7, borderRadius: "50%",
                                background: agent.color, flexShrink: 0,
                            }} />
                            <span className="room-right-agent-name">@{agent.name}</span>
                        </button>
                    ))}
                </div>

                {/* Footer */}
                <div className="room-right-footer">
                    <button
                        className="room-right-footer-btn"
                        onClick={() => router.push(`/tasks/${roomId}`)}
                    >
                        <Ico d={P.check} size={12} stroke="var(--text-2)" />
                        Task Board
                        <svg width={10} height={10} viewBox="0 0 24 24" fill="none"
                            stroke="var(--text-3)" strokeWidth="2" strokeLinecap="round"
                            style={{ marginLeft: "auto" }}>
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </button>

                    {!isOwner && (
                        <button
                            className="room-right-footer-btn room-right-footer-btn-danger"
                            onClick={onLeave}
                        >
                            <Ico d={P.logout} size={12} stroke="#ef4444" />
                            Leave room
                        </button>
                    )}
                </div>
            </div>

            {/* Profile modal — outside panel so it's not clipped */}
            <MemberProfileModal
                userId={activeUserId}
                onClose={() => setActiveUserId(null)}
            />
        </>
    );
}