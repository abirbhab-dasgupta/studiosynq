"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Ico, P } from "./icons";
import { Theme } from "./tokens";
import { useRouter } from "next/navigation";

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
    const [newRoomName, setNewRoomName] = useState("");
    const [creating, setCreating] = useState(false);
    const router = useRouter();

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

    const s = (obj: React.CSSProperties): React.CSSProperties => obj;

    return (
        <div>
            <div style={{
                display: "flex", alignItems: "center",
                justifyContent: "space-between", marginBottom: 12,
            }}>
                <span style={s({ fontSize: 14, fontWeight: 500, color: T.text })}>
                    Active Rooms
                </span>
            </div>

            <div style={{
                display: "grid",
                // 1 column on mobile, 3 on desktop
                gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)",
                gap: 10,
            }}>
                {rooms.map(r => (
                    <div key={r.id} style={s({
                        background: T.bg3, border: `1px solid ${T.border}`,
                        borderRadius: 12, padding: "16px 18px", cursor: "pointer",
                        transition: "border-color .2s",
                    })}>
                        <div style={{
                            display: "flex", justifyContent: "space-between",
                            alignItems: "flex-start", marginBottom: 12,
                        }}>
                            <span style={s({
                                fontSize: 13, fontWeight: 500, color: T.text,
                                lineHeight: 1.3,
                            })}>{r.name}</span>
                            <div style={{
                                width: 7, height: 7, borderRadius: "50%",
                                background: "#10b981", marginTop: 4, flexShrink: 0,
                            }} />
                        </div>
                        <div style={{ display: "flex", justifyContent: "flex-end" }}>
                            <button
                                onClick={() => router.push(`/rooms/${r.id}`)}
                                style={s({
                                    fontSize: 11, fontWeight: 500,
                                    background: T.surface, border: `1px solid ${T.border}`,
                                    borderRadius: 6, padding: "4px 12px", color: T.text2,
                                    cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
                                })}>
                                Open
                            </button>
                        </div>
                    </div>
                ))}

                {creating ? (
                    <div style={s({
                        border: `1px solid ${T.border}`, borderRadius: 12,
                        padding: "16px 18px", display: "flex",
                        flexDirection: "column", gap: 8,
                    })}>
                        <input
                            autoFocus
                            value={newRoomName}
                            onChange={e => setNewRoomName(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && newRoomName && createRoom.mutate(newRoomName)}
                            placeholder="Room name..."
                            style={s({
                                background: T.surface, border: `1px solid ${T.border}`,
                                borderRadius: 6, padding: "7px 10px", fontSize: 13,
                                color: T.text, fontFamily: "'DM Sans',sans-serif",
                                outline: "none", width: "100%",
                            })}
                        />
                        <div style={{ display: "flex", gap: 6 }}>
                            <button
                                onClick={() => newRoomName && createRoom.mutate(newRoomName)}
                                style={s({
                                    flex: 1, padding: "6px 0", background: T.amber,
                                    color: "#fff", border: "none", borderRadius: 6,
                                    fontSize: 12, fontWeight: 600, cursor: "pointer",
                                    fontFamily: "'DM Sans',sans-serif",
                                })}>
                                {createRoom.isPending ? "Creating..." : "Create"}
                            </button>
                            <button
                                onClick={() => setCreating(false)}
                                style={s({
                                    padding: "6px 12px", background: T.surface,
                                    color: T.text2, border: `1px solid ${T.border}`,
                                    borderRadius: 6, fontSize: 12, cursor: "pointer",
                                    fontFamily: "'DM Sans',sans-serif",
                                })}>
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <div onClick={() => setCreating(true)} style={s({
                        border: `1px dashed ${T.border}`, borderRadius: 12,
                        display: "flex", flexDirection: "column", alignItems: "center",
                        justifyContent: "center", gap: 7, minHeight: 90, cursor: "pointer",
                    })}>
                        <div style={s({
                            width: 28, height: 28, borderRadius: "50%",
                            border: `1px solid ${T.border}`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                        })}>
                            <Ico d={P.plus} size={13} stroke={T.text3} />
                        </div>
                        <span style={s({ fontSize: 12, color: T.text3 })}>Create room</span>
                    </div>
                )}
            </div>
        </div>
    );
}