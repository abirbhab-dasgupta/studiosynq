"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Ico, P } from "@/components/dashboard/icons";

type Room = {
    id: string;
    name: string;
    isActive: boolean;
    createdAt: string;
};

type Props = {
    user: { id: string; name: string; email: string };
};

export function RoomsPageClient({ user }: Props) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [creating, setCreating] = useState(false);
    const [newRoomName, setNewRoomName] = useState("");

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
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["rooms"] });
            setNewRoomName("");
            setCreating(false);
            router.push(`/rooms/${data.id}`);
        },
    });

    return (
        <div className="dashboard-content">

            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                    <p style={{
                        fontSize: 11, fontWeight: 600, textTransform: "uppercase",
                        letterSpacing: ".12em", color: "var(--text-3)",
                        fontFamily: "var(--font-mono)", marginBottom: 6,
                    }}>Workspace</p>
                    <h1 style={{
                        fontSize: 24, fontWeight: 400,
                        fontFamily: "var(--font-serif)",
                        color: "var(--text)", letterSpacing: "-.3px",
                    }}>Your Rooms</h1>
                </div>
                <button
                    onClick={() => setCreating(true)}
                    style={{
                        display: "flex", alignItems: "center", gap: 6,
                        height: 36, padding: "0 16px",
                        background: "var(--amber)", color: "#fff",
                        border: "none", borderRadius: 8,
                        fontSize: 13, fontWeight: 600, cursor: "pointer",
                        fontFamily: "var(--font-sans)",
                    }}>
                    <Ico d={P.plus} size={13} stroke="#fff" />
                    New Room
                </button>
            </div>

            {/* Create room form */}
            {creating && (
                <div style={{
                    background: "var(--bg3)",
                    border: "1px solid var(--border)",
                    borderRadius: 12, padding: "16px 20px",
                    display: "flex", alignItems: "center", gap: 10,
                }}>
                    <input
                        autoFocus
                        value={newRoomName}
                        onChange={e => setNewRoomName(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && newRoomName && createRoom.mutate(newRoomName)}
                        placeholder="Room name..."
                        style={{
                            flex: 1, height: 36, padding: "0 12px",
                            background: "var(--surface)",
                            border: "1px solid var(--border)",
                            borderRadius: 8, fontSize: 13,
                            color: "var(--text)",
                            fontFamily: "var(--font-sans)", outline: "none",
                        }}
                    />
                    <button
                        onClick={() => newRoomName && createRoom.mutate(newRoomName)}
                        disabled={createRoom.isPending}
                        style={{
                            height: 36, padding: "0 16px",
                            background: "var(--amber)", color: "#fff",
                            border: "none", borderRadius: 8,
                            fontSize: 13, fontWeight: 600,
                            cursor: "pointer", fontFamily: "var(--font-sans)",
                            opacity: createRoom.isPending ? 0.7 : 1,
                        }}>
                        {createRoom.isPending ? "Creating..." : "Create"}
                    </button>
                    <button
                        onClick={() => { setCreating(false); setNewRoomName(""); }}
                        style={{
                            height: 36, padding: "0 14px",
                            background: "var(--surface)",
                            border: "1px solid var(--border)",
                            borderRadius: 8, fontSize: 13,
                            color: "var(--text-2)", cursor: "pointer",
                            fontFamily: "var(--font-sans)",
                        }}>
                        Cancel
                    </button>
                </div>
            )}

            {/* Rooms grid */}
            {rooms.length === 0 && !creating ? (
                <div style={{
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center",
                    gap: 12, padding: "60px 0",
                    border: "1px dashed var(--border)",
                    borderRadius: 16,
                }}>
                    <div style={{
                        width: 40, height: 40, borderRadius: "50%",
                        border: "1px solid var(--border)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                        <Ico d={P.grid} size={16} stroke="var(--text-3)" />
                    </div>
                    <p style={{ fontSize: 14, color: "var(--text-3)" }}>
                        No rooms yet
                    </p>
                    <button
                        onClick={() => setCreating(true)}
                        style={{
                            height: 32, padding: "0 16px",
                            background: "var(--surface)",
                            border: "1px solid var(--border)",
                            borderRadius: 8, fontSize: 12,
                            color: "var(--text-2)", cursor: "pointer",
                            fontFamily: "var(--font-sans)",
                        }}>
                        Create your first room
                    </button>
                </div>
            ) : (
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                    gap: 12,
                }}>
                    {rooms.map(r => (
                        <div key={r.id} style={{
                            background: "var(--bg3)",
                            border: "1px solid var(--border)",
                            borderRadius: 14, padding: "20px",
                            display: "flex", flexDirection: "column", gap: 12,
                            cursor: "pointer", transition: "border-color .2s",
                        }}>
                            <div style={{
                                display: "flex", alignItems: "flex-start",
                                justifyContent: "space-between",
                            }}>
                                <div style={{
                                    width: 36, height: 36, borderRadius: 9,
                                    background: "var(--amber-faint)",
                                    display: "flex", alignItems: "center",
                                    justifyContent: "center",
                                }}>
                                    <Ico d={P.grid} size={15} stroke="var(--amber)" />
                                </div>
                                <div style={{
                                    width: 7, height: 7, borderRadius: "50%",
                                    background: r.isActive ? "#10b981" : "var(--text-3)",
                                    marginTop: 4,
                                }} />
                            </div>

                            <div>
                                <p style={{
                                    fontSize: 14, fontWeight: 500,
                                    color: "var(--text)", marginBottom: 4,
                                }}>{r.name}</p>
                                <p style={{
                                    fontSize: 11, color: "var(--text-3)",
                                    fontFamily: "var(--font-mono)",
                                }}>
                                    Created {new Date(r.createdAt).toLocaleDateString()}
                                </p>
                            </div>

                            <button
                                onClick={() => router.push(`/rooms/${r.id}`)}
                                style={{
                                    height: 32, width: "100%",
                                    background: "var(--surface)",
                                    border: "1px solid var(--border)",
                                    borderRadius: 8, fontSize: 12,
                                    fontWeight: 500, color: "var(--text-2)",
                                    cursor: "pointer",
                                    fontFamily: "var(--font-sans)",
                                    transition: "background .15s",
                                }}>
                                Open room →
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}