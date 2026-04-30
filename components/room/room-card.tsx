"use client";

import { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Ico, P, ThreeDots, Crown } from "@/components/dashboard/icons";

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
    isOwner: boolean;
    onDelete: (id: string) => void;
    onUpdate: (id: string, name: string) => void;
    isUpdating: boolean;
};

export function RoomCard({ room, isOwner, onDelete, onUpdate, isUpdating }: Props) {
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

            {/* Top row */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{
                    width: 34, height: 34, borderRadius: 9,
                    background: "var(--amber-faint)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                    <Ico d={P.grid} size={15} stroke="var(--amber)" />
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {isOwner && (
                        <Crown size={13} stroke="var(--amber)" />
                    )}

                    {isOwner && (
                        <div style={{ position: "relative" }} ref={menuRef}>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setMenuOpen(o => !o);
                                }}
                                className={`room-card-menu-btn ${menuOpen ? "active" : ""}`}
                            >
                                <ThreeDots size={15} stroke="var(--text-2)" />
                            </button>

                            {menuOpen && (
                                <div className="room-card-dropdown">
                                    <button
                                        className="room-card-dropdown-btn"
                                        style={{ color: "var(--text-2)" }}
                                        onClick={() => {
                                            setEditing(true);
                                            setEditName(room.name);
                                            setMenuOpen(false);
                                        }}
                                    >
                                        <Ico d={PENCIL} size={12} stroke="var(--text-2)" />
                                        Rename
                                    </button>
                                    <div style={{ height: 1, background: "var(--border)" }} />
                                    <button
                                        className="room-card-dropdown-btn"
                                        style={{ color: "#ef4444" }}
                                        onClick={() => {
                                            onDelete(room.id);
                                            setMenuOpen(false);
                                        }}
                                    >
                                        <Ico d={TRASH} size={12} stroke="#ef4444" />
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Editable or static name */}
            {editing ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
                    <input
                        autoFocus
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === "Enter" && editName) {
                                onUpdate(room.id, editName);
                                setEditing(false);
                            }
                            if (e.key === "Escape") setEditing(false);
                        }}
                        className="room-card-edit-input"
                    />
                    <div style={{ display: "flex", gap: 6 }}>
                        <button
                            className="room-card-save-btn"
                            onClick={() => {
                                if (editName) {
                                    onUpdate(room.id, editName);
                                    setEditing(false);
                                }
                            }}
                        >
                            Save
                        </button>
                        <button
                            className="room-card-cancel-btn"
                            onClick={() => setEditing(false)}
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