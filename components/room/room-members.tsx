"use client";

import { useState } from "react";
import { MemberProfileModal } from "@/components/shared/member-profile-modal";

type Member = {
    userId: string;
    joinedAt: string;
    name: string;
    image: string | null;
    avatarColor: string | null;
};

type Props = {
    members: Member[];
    currentUserId: string;
};

export function RoomMembers({ members, currentUserId }: Props) {
    const [activeUserId, setActiveUserId] = useState<string | null>(null);

    return (
        <>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <p className="room-section-label">Members</p>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                    {members.map((member) => {
                        const isYou = member.userId === currentUserId;
                        const color = member.avatarColor ?? "#D97706";

                        return (
                            <button
                                key={member.userId}
                                className="room-member-card"
                                onClick={() => setActiveUserId(member.userId)}
                                style={{
                                    background: "var(--bg3)",
                                    border: "1px solid var(--border)",
                                    borderRadius: 12,
                                    padding: "10px 14px",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 12,
                                    cursor: "pointer",
                                    transition: "border-color 0.15s",
                                    textAlign: "left",
                                    width: "100%",
                                }}
                                onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--border-m)")}
                                onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}
                            >
                                {member.image ? (
                                    <img
                                        src={member.image}
                                        alt={member.name}
                                        style={{
                                            width: 32, height: 32, borderRadius: "50%",
                                            objectFit: "cover", flexShrink: 0,
                                            border: "2px solid var(--border)",
                                        }}
                                    />
                                ) : (
                                    <div style={{
                                        width: 32, height: 32, borderRadius: "50%",
                                        background: color + "22",
                                        border: `2px solid ${color}55`,
                                        color: color,
                                        fontSize: 12, fontWeight: 600,
                                        display: "flex", alignItems: "center",
                                        justifyContent: "center",
                                        fontFamily: "var(--font-mono)",
                                        flexShrink: 0,
                                    }}>
                                        {(member.name ?? "?").charAt(0).toUpperCase()}
                                    </div>
                                )}

                                <div>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <span className="room-member-name">{member.name ?? "Member"}</span>
                                        {isYou && <span className="room-member-you">you</span>}
                                    </div>
                                    <p className="room-member-date">
                                        Joined {new Date(member.joinedAt).toLocaleDateString()}
                                    </p>
                                </div>

                                <div className="room-member-online" style={{ marginLeft: "auto" }} />
                            </button>
                        );
                    })}
                </div>
            </div>

            <MemberProfileModal
                userId={activeUserId}
                onClose={() => setActiveUserId(null)}
            />
        </>
    );
}