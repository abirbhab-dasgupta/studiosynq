"use client";

import { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Ico, P } from "@/components/dashboard/icons";

const DOTS = "M12 5h.01M12 12h.01M12 19h.01";
const PENCIL = "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7 M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z";
const TRASH = "M3 6h18 M19 6l-1 14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2L3 6 M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2";

type Room = {
    id: string;
    name: string;
    isActive: boolean;
    createdAt: string;
};

type Props = {
    room: Room;
    onDelete: (id: string) => void;
    onUpdate: (id: string, name: string) => void;
    isUpdating: boolean;
};

export function RoomCard({ room, onDelete, onUpdate, isUpdating }: Props) {
    const router = useRouter();
    const [menuOpen, setMenuOpen] = useState(false);
    const [editing, setEditing] = useState(false);
    const [editName, setEditName] = useState(room.name);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    return (
        <div className="room-card">

            {/* Top row — icon + status + three dot */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{
                    width: 34, height: 34, borderRadius: 9,
                    background: "var(--amber-faint)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                    <Ico d={P.grid} size={15} stroke="var(--amber)" />
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div className="room-card-dot" style={{
                        background: room.isActive ? "#10b981" : "var(--text-3)",
                    }} />

                    {/* Three dot menu */}
                    <div style={{ position: "relative" }} ref={menuRef}>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setMenuOpen(o => !o);
                            }}
                            style={{
                                width: 28, height: 28, borderRadius: 6,
                                background: menuOpen ? "var(--surface-h)" : "transparent",
                                border: "1px solid transparent",
                                display: "flex", alignItems: "center",
                                justifyContent: "center", cursor: "pointer",
                                transition: "background .15s",
                            }}
                        >
                            <Ico d={DOTS} size={15} stroke="var(--text-2)" />
                        </button>

                        {menuOpen && (
                            <div style={{
                                position: "absolute", right: 0, top: 32,
                                zIndex: 50, width: 148,
                                background: "var(--bg2)",
                                border: "1px solid var(--border-m)",
                                borderRadius: 10,
                                boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
                                overflow: "hidden",
                            }}>
                                <button
                                    onClick={() => {
                                        setEditing(true);
                                        setEditName(room.name);
                                        setMenuOpen(false);
                                    }}
                                    style={{
                                        display: "flex", alignItems: "center",
                                        gap: 8, width: "100%",
                                        padding: "9px 12px",
                                        background: "transparent",
                                        border: "none", cursor: "pointer",
                                        fontSize: 12, color: "var(--text-2)",
                                        fontFamily: "var(--font-sans)",
                                        textAlign: "left",
                                    }}
                                >
                                    <Ico d={PENCIL} size={12} stroke="var(--text-2)" />
                                    Rename
                                </button>
                                <div style={{ height: 1, background: "var(--border)" }} />
                                <button
                                    onClick={() => {
                                        onDelete(room.id);
                                        setMenuOpen(false);
                                    }}
                                    style={{
                                        display: "flex", alignItems: "center",
                                        gap: 8, width: "100%",
                                        padding: "9px 12px",
                                        background: "transparent",
                                        border: "none", cursor: "pointer",
                                        fontSize: 12, color: "#ef4444",
                                        fontFamily: "var(--font-sans)",
                                        textAlign: "left",
                                    }}
                                >
                                    <Ico d={TRASH} size={12} stroke="#ef4444" />
                                    Delete
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Room name — editable or static */}
            {editing ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
                    <input
                        autoFocus
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === "Enter" && editName) onUpdate(room.id, editName);
                            if (e.key === "Escape") setEditing(false);
                        }}
                        style={{
                            height: 36, padding: "0 10px",
                            background: "var(--surface)",
                            border: "1px solid var(--border-m)",
                            borderRadius: 7, fontSize: 13,
                            color: "var(--text)",
                            fontFamily: "var(--font-sans)", outline: "none",
                        }}
                    />
                    <div style={{ display: "flex", gap: 6 }}>
                        <button
                            onClick={() => editName && onUpdate(room.id, editName)}
                            disabled={isUpdating}
                            style={{
                                flex: 1, height: 30,
                                background: "var(--amber)", color: "#fff",
                                border: "none", borderRadius: 6,
                                fontSize: 12, fontWeight: 600,
                                cursor: "pointer", fontFamily: "var(--font-sans)",
                                opacity: isUpdating ? 0.7 : 1,
                            }}
                        >
                            {isUpdating ? "Saving..." : "Save"}
                        </button>
                        <button
                            onClick={() => setEditing(false)}
                            style={{
                                flex: 1, height: 30,
                                background: "var(--surface)",
                                border: "1px solid var(--border)",
                                borderRadius: 6, fontSize: 12,
                                color: "var(--text-2)", cursor: "pointer",
                                fontFamily: "var(--font-sans)",
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    <div style={{ flex: 1 }}>
                        <p className="room-card-name">{room.name}</p>
                        <p className="room-card-date">
                            Created {new Date(room.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                    <div className="room-card-footer">
                        <button
                            className="room-card-open"
                            onClick={() => router.push(`/rooms/${room.id}`)}
                        >
                            Open room →
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}