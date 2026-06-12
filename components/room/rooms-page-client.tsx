"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState, Component, type ReactNode } from "react";
import { Ico, P } from "@/components/dashboard/icons";
import { RoomCard } from "./room-card";
import { CreateRoomForm } from "./create-room-form";
import { DeleteConfirm } from "./delete-confirm";

type Room = {
    id: string;
    name: string;
    isActive: boolean;
    createdAt: string;
    createdBy: string;
};

type Props = {
    user: { id: string; name: string; email: string };
};

// ── Error Boundary ────────────────────────────────────────────────────────────

class RoomsErrorBoundary extends Component<
    { children: ReactNode },
    { hasError: boolean }
> {
    constructor(props: { children: ReactNode }) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError() {
        return { hasError: true };
    }
    render() {
        if (this.state.hasError) {
            return (
                <div className="rooms-empty">
                    <div style={{
                        width: 44, height: 44, borderRadius: 12,
                        background: "rgba(239,68,68,0.08)",
                        border: "1px solid rgba(239,68,68,0.2)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 20,
                    }}>⚠</div>
                    <p className="rooms-empty-title">Failed to load rooms</p>
                    <p className="rooms-empty-subtitle">
                        Something went wrong. Refresh the page to try again.
                    </p>
                    <button
                        className="rooms-create-btn"
                        onClick={() => window.location.reload()}
                    >
                        Refresh page
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function RoomsSkeleton() {
    return (
        <div className="rooms-page">
            {/* Header */}
            <div className="rooms-page-header">
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <div className="skeleton" style={{ width: 80, height: 10, borderRadius: 3 }} />
                    <div className="skeleton" style={{ width: 140, height: 26, borderRadius: 6 }} />
                </div>
                <div className="skeleton" style={{ width: 110, height: 36, borderRadius: 8 }} />
            </div>
            {/* Grid */}
            <div className="rooms-grid">
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} style={{
                        height: 140, borderRadius: 14,
                        border: "1px solid var(--border)",
                        background: "var(--bg3)",
                        padding: "18px",
                        display: "flex", flexDirection: "column", justifyContent: "space-between",
                    }}>
                        <div className="skeleton" style={{ width: 8, height: 8, borderRadius: "50%", alignSelf: "flex-end" }} />
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            <div className="skeleton" style={{ width: "65%", height: 13, borderRadius: 4 }} />
                            <div className="skeleton" style={{ width: "45%", height: 10, borderRadius: 3 }} />
                        </div>
                        <div className="skeleton" style={{ width: 72, height: 28, borderRadius: 7, alignSelf: "flex-end" }} />
                    </div>
                ))}
            </div>
        </div>
    );
}

// ── Main component ────────────────────────────────────────────────────────────

export function RoomsPageClient({ user }: Props) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [creating, setCreating] = useState(false);
    const [newRoomName, setNewRoomName] = useState("");
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    const { data: rooms = [], isLoading } = useQuery<Room[]>({
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

    const updateRoom = useMutation({
        mutationFn: ({ id, name }: { id: string; name: string }) =>
            fetch(`/api/rooms/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name }),
            }).then(r => r.json()),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["rooms"] }),
    });

    const deleteRoom = useMutation({
        mutationFn: (id: string) =>
            fetch(`/api/rooms/${id}`, { method: "DELETE" }).then(r => r.json()),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["rooms"] });
            setDeleteConfirm(null);
        },
    });

    if (isLoading) return <RoomsSkeleton />;

    return (
        <RoomsErrorBoundary>
            <div className="rooms-page">
                {deleteConfirm && (
                    <DeleteConfirm
                        onConfirm={() => deleteRoom.mutate(deleteConfirm)}
                        onCancel={() => setDeleteConfirm(null)}
                        isPending={deleteRoom.isPending}
                    />
                )}

                <div className="rooms-page-header">
                    <div>
                        <p className="rooms-page-label">Workspace</p>
                        <h1 className="rooms-page-title">Your Rooms</h1>
                    </div>
                    <button className="rooms-create-btn" onClick={() => setCreating(true)}>
                        <Ico d={P.plus} size={13} stroke="#fff" />
                        New Room
                    </button>
                </div>

                {creating && (
                    <CreateRoomForm
                        value={newRoomName}
                        onChange={setNewRoomName}
                        onSubmit={() => newRoomName && createRoom.mutate(newRoomName)}
                        onCancel={() => { setCreating(false); setNewRoomName(""); }}
                        isPending={createRoom.isPending}
                    />
                )}

                {rooms.length === 0 && !creating ? (
                    <div className="rooms-empty">
                        <div className="rooms-empty-icon">
                            <Ico d={P.grid} size={20} stroke="var(--text-3)" />
                        </div>
                        <p className="rooms-empty-title">No rooms yet</p>
                        <p className="rooms-empty-subtitle">
                            Create a room to start collaborating with your team and AI agents.
                        </p>
                        <button className="rooms-create-btn" onClick={() => setCreating(true)}>
                            <Ico d={P.plus} size={13} stroke="#fff" />
                            Create your first room
                        </button>
                    </div>
                ) : (
                    <div className="rooms-grid">
                        {rooms.map(r => (
                            <RoomCard
                                key={r.id}
                                room={r}
                                isOwner={r.createdBy === user.id}
                                onDelete={setDeleteConfirm}
                                onUpdate={(id, name) => updateRoom.mutate({ id, name })}
                                isUpdating={updateRoom.isPending}
                            />
                        ))}
                    </div>
                )}
            </div>
        </RoomsErrorBoundary>
    );
}