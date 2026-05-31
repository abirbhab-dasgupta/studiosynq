"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
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

export function TasksRoomPicker({ user }: Props) {
    const router = useRouter();

    const { data: rooms, isLoading } = useQuery<Room[]>({
        queryKey: ["rooms"],
        queryFn: () => fetch("/api/rooms").then(r => r.json()),
    });

    return (
        <div className="tasks-page">
            {/* Page header */}
            <div className="flex flex-col gap-1.5">
                <p className="rooms-page-label">Workspace</p>
                <h1 className="rooms-page-title">Task Boards</h1>
                <p className="text-[13px] text-[var(--text-2)]">
                    Select a room to open its Kanban board.
                </p>
            </div>

            {/* Room grid */}
            {isLoading ? (
                <div className="rooms-grid">
                    {[1, 2, 3].map(i => (
                        <div
                            key={i}
                            className="h-[120px] rounded-xl border border-[var(--border)] bg-[var(--surface)] animate-pulse"
                        />
                    ))}
                </div>
            ) : !rooms?.length ? (
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
                    <button
                        onClick={() => router.push("/rooms")}
                        className="tasks-picker-go-btn"
                    >
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
    );
}

function RoomCard({
    room,
    isOwner,
    onClick,
}: {
    room: Room;
    isOwner: boolean;
    onClick: () => void;
}) {
    return (
        <div
            onClick={onClick}
            className="tasks-room-card"
        >
            {/* Top row */}
            <div className="flex items-start justify-between">
                <div className="tasks-room-card-icon">
                    <Ico d={P.check} size={14} stroke="var(--amber)" />
                </div>
                {isOwner && (
                    <span className="tasks-room-card-owner-badge">
                        Owner
                    </span>
                )}
            </div>

            {/* Room name + date */}
            <div className="flex flex-col gap-0.5">
                <p className="room-card-name">{room.name}</p>
                <p className="room-card-date">
                    Created {new Date(room.createdAt).toLocaleDateString()}
                </p>
            </div>

            {/* Open board link */}
            <div className="flex items-center gap-1 mt-auto text-[12px] font-medium text-[var(--text-2)]">
                Open board
                <Ico d="M5 12h14 M12 5l7 7-7 7" size={11} stroke="var(--text-2)" />
            </div>
        </div>
    );
}