"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Ico, P } from "./icons";
import { Theme } from "./tokens";

type Room = {
    id: string;
    name: string;
    isActive: boolean;
};

type Props = {
    T: Theme;
    isMobile: boolean;
};

export function RoomsGrid({ T, isMobile }: Props) {
    const queryClient = useQueryClient();
    const router = useRouter();
    const [newRoomName, setNewRoomName] = useState("");
    const [creating, setCreating] = useState(false);

    const { data: rooms = [] } = useQuery<Room[]>({
        queryKey: ["rooms"],
        queryFn: () => fetch("/api/rooms").then(r => r.json()),
    });

    const createRoom = useMutation({
        mutationFn: (name: string) =>
            fetch("/api/rooms", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name }),
            }).then(r => r.json()),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["rooms"] });
            queryClient.invalidateQueries({ queryKey: ["stats"] });
            setNewRoomName("");
            setCreating(false);
        },
    });

    return (
        <div>
            <div style={{
                display: "flex", alignItems: "center",
                justifyContent: "space-between", marginBottom: 12,
            }}>
                <span style={{
                    fontSize: 14, fontWeight: 500, color: "var(--text)",
                }}>Active Rooms</span>
            </div>

            <div style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)",
                gap: 10,
            }}>
                {rooms.map(r => (
                    <div key={r.id} style={{
                        background: T.bg3,
                        border: `1px solid ${T.border}`,
                        borderRadius: 12,
                        padding: "16px 18px",
                        cursor: "pointer",
                        transition: "border-color .2s",
                    }}>
                        <div style={{
                            display: "flex", justifyContent: "space-between",
                            alignItems: "flex-start", marginBottom: 12,
                        }}>
                            <span style={{
                                fontSize: 13, fontWeight: 500,
                                color: "var(--text)", lineHeight: 1.3,
                            }}>{r.name}</span>

                        </div>
                        <div style={{ display: "flex", justifyContent: "flex-end" }}>
                            <button
                                onClick={() => router.push(`/rooms/${r.id}`)}
                                style={{
                                    fontSize: 11, fontWeight: 500,
                                    background: T.surface,
                                    border: `1px solid ${T.border}`,
                                    borderRadius: 6, padding: "4px 12px",
                                    color: "var(--text-2)", cursor: "pointer",
                                    fontFamily: "var(--font-sans)",
                                }}>
                                Open
                            </button>
                        </div>
                    </div>
                ))}

                {creating ? (
                    <div style={{
                        border: `1px solid ${T.border}`,
                        borderRadius: 12, padding: "16px 18px",
                        display: "flex", flexDirection: "column", gap: 8,
                    }}>
                        <input
                            autoFocus
                            value={newRoomName}
                            onChange={e => setNewRoomName(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && newRoomName && createRoom.mutate(newRoomName)}
                            placeholder="Room name..."
                            style={{
                                background: T.surface,
                                border: `1px solid ${T.border}`,
                                borderRadius: 6, padding: "7px 10px",
                                fontSize: 13, color: "var(--text)",
                                fontFamily: "var(--font-sans)",
                                outline: "none", width: "100%",
                            }}
                        />
                        <div style={{ display: "flex", gap: 6 }}>
                            <button
                                onClick={() => newRoomName && createRoom.mutate(newRoomName)}
                                style={{
                                    flex: 1, padding: "6px 0",
                                    background: "var(--amber)",
                                    color: "#fff", border: "none",
                                    borderRadius: 6, fontSize: 12,
                                    fontWeight: 600, cursor: "pointer",
                                    fontFamily: "var(--font-sans)",
                                }}>
                                {createRoom.isPending ? "Creating..." : "Create"}
                            </button>
                            <button
                                onClick={() => setCreating(false)}
                                style={{
                                    padding: "6px 12px",
                                    background: T.surface,
                                    color: "var(--text-2)",
                                    border: `1px solid ${T.border}`,
                                    borderRadius: 6, fontSize: 12,
                                    cursor: "pointer",
                                    fontFamily: "var(--font-sans)",
                                }}>
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <div
                        onClick={() => setCreating(true)}
                        style={{
                            border: `1px dashed ${T.border}`,
                            borderRadius: 12,
                            display: "flex", flexDirection: "column",
                            alignItems: "center", justifyContent: "center",
                            gap: 7, minHeight: 90, cursor: "pointer",
                        }}>
                        <div style={{
                            width: 28, height: 28, borderRadius: "50%",
                            border: `1px solid ${T.border}`,
                            display: "flex", alignItems: "center",
                            justifyContent: "center",
                        }}>
                            <Ico d={P.plus} size={13} stroke="var(--text-3)" />
                        </div>
                        <span style={{
                            fontSize: 12, color: "var(--text-3)",
                        }}>Create room</span>
                    </div>
                )}
            </div>
        </div>
    );
}