"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Component, type ReactNode } from "react";
import { Ico, P } from "@/components/dashboard/icons";

type Room = {
    id: string;
    name: string;
    createdBy: string;
    isActive: boolean;
    createdAt: string;
};

type Props = {
    user: { id: string; name: string; email: string };
};

// ── Error Boundary ────────────────────────────────────────────────────────────

class TasksErrorBoundary extends Component<
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
                    <p className="rooms-empty-title">Failed to load task boards</p>
                    <p className="rooms-empty-subtitle">
                        Something went wrong. Refresh the page to try again.
                    </p>
                    <button
                        className="tasks-picker-go-btn"
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

function TasksSkeleton() {
    return (
        <div className="tasks-page">
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div className="skeleton" style={{ width: 80, height: 10, borderRadius: 3 }} />
                <div className="skeleton" style={{ width: 160, height: 26, borderRadius: 6 }} />
                <div className="skeleton" style={{ width: 220, height: 12, borderRadius: 3 }} />
            </div>
            <div className="rooms-grid">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} style={{
                        height: 140, borderRadius: 12,
                        border: "1px solid var(--border)",
                        background: "var(--bg2)",
                        padding: "16px",
                        display: "flex", flexDirection: "column",
                        justifyContent: "space-between",
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <div className="skeleton" style={{ width: 34, height: 34, borderRadius: 9 }} />
                            <div className="skeleton" style={{ width: 48, height: 18, borderRadius: 4 }} />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            <div className="skeleton" style={{ width: "60%", height: 13, borderRadius: 4 }} />
                            <div className="skeleton" style={{ width: "40%", height: 10, borderRadius: 3 }} />
                        </div>
                        <div className="skeleton" style={{ width: 80, height: 11, borderRadius: 3 }} />
                    </div>
                ))}
            </div>
        </div>
    );
}

// ── Main component ────────────────────────────────────────────────────────────

export function TasksRoomPicker({ user }: Props) {
    const router = useRouter();

    const { data: rooms, isLoading, isError } = useQuery<Room[]>({
        queryKey: ["rooms"],
        queryFn: () => fetch("/api/rooms").then(r => r.json()),
    });

    if (isLoading) return <TasksSkeleton />;

    if (isError) {
        return (
            <div className="tasks-page">
                <div className="rooms-empty">
                    <div style={{
                        width: 44, height: 44, borderRadius: 12,
                        background: "rgba(239,68,68,0.08)",
                        border: "1px solid rgba(239,68,68,0.2)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 20,
                    }}>⚠</div>
                    <p className="rooms-empty-title">Couldn&apos;t load rooms</p>
                    <p className="rooms-empty-subtitle">
                        Check your connection and try again.
                    </p>
                    <button className="tasks-picker-go-btn" onClick={() => window.location.reload()}>
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <TasksErrorBoundary>
            <div className="tasks-page">
                <div className="flex flex-col gap-1.5">
                    <p className="rooms-page-label">Workspace</p>
                    <h1 className="rooms-page-title">Task Boards</h1>
                    <p className="text-[13px] text-[var(--text-2)]">
                        Select a room to open its Kanban board.
                    </p>
                </div>

                {!rooms?.length ? (
                    <div className="rooms-empty">
                        <div className="rooms-empty-icon">
                            <Ico d={P.check} size={18} stroke="var(--text-3)" />
                        </div>
                        <div className="text-center flex flex-col gap-1">
                            <p className="rooms-empty-title">No rooms yet</p>
                            <p className="rooms-empty-subtitle">
                                Create or join a room to start managing tasks.
                            </p>
                        </div>
                        <button onClick={() => router.push("/rooms")} className="tasks-picker-go-btn">
                            Go to Rooms
                        </button>
                    </div>
                ) : (
                    <div className="rooms-grid">
                        {rooms.map(room => (
                            <RoomCard
                                key={room.id}
                                room={room}
                                isOwner={room.createdBy === user.id}
                                onClick={() => router.push(`/tasks/${room.id}`)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </TasksErrorBoundary>
    );
}

// ── Room Card ─────────────────────────────────────────────────────────────────

function RoomCard({ room, isOwner, onClick }: { room: Room; isOwner: boolean; onClick: () => void }) {
    return (
        <div onClick={onClick} className="tasks-room-card">
            <div className="flex items-start justify-between">
                <div className="tasks-room-card-icon">
                    <Ico d={P.check} size={14} stroke="var(--amber)" />
                </div>
                {isOwner && <span className="tasks-room-card-owner-badge">Owner</span>}
            </div>
            <div className="flex flex-col gap-0.5">
                <p className="room-card-name">{room.name}</p>
                <p className="room-card-date">
                    Created {new Date(room.createdAt).toLocaleDateString()}
                </p>
            </div>
            <div className="flex items-center gap-1 mt-auto text-[12px] font-medium text-[var(--text-2)]">
                Open board
                <Ico d="M5 12h14 M12 5l7 7-7 7" size={11} stroke="var(--text-2)" />
            </div>
        </div>
    );
}