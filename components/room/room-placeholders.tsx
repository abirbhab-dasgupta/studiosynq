"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import type { Task } from "@/hooks/useTasks";

type Props = {
    roomId: string;
};

export function RoomPlaceholders({ roomId }: Props) {
    const router = useRouter();

    const { data: tasks } = useQuery<Task[]>({
        queryKey: ["tasks", roomId],
        queryFn: () => fetch(`/api/rooms/${roomId}/tasks`).then(r => r.json()),
        refetchInterval: 5000,
    });

    const totalTasks = tasks?.length ?? 0;
    const doneTasks = tasks?.filter(t => t.status === "done").length ?? 0;
    const inProgressTasks = tasks?.filter(t => t.status === "in_progress").length ?? 0;

    return (
        <div className="room-placeholder-grid">

            {/* Task Board — live, clickable */}
            <button
                className="room-placeholder-card room-placeholder-card-clickable"
                onClick={() => router.push(`/tasks/${roomId}`)}
            >
                <div className="room-placeholder-icon" style={{ background: "#6366f115" }}>
                    <svg width={18} height={18} viewBox="0 0 24 24" fill="none"
                        stroke="#6366f1" strokeWidth="1.6"
                        strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 11l3 3L22 4" />
                        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                    </svg>
                </div>
                <p className="room-placeholder-name">Task Board</p>
                <p className="room-placeholder-desc">Kanban board for tracking tasks</p>

                {totalTasks > 0 ? (
                    <div className="room-placeholder-stats">
                        <span className="room-placeholder-stat">
                            <span style={{ color: "#D97706" }}>●</span>
                            {inProgressTasks} in progress
                        </span>
                        <span className="room-placeholder-stat">
                            <span style={{ color: "#10b981" }}>●</span>
                            {doneTasks}/{totalTasks} done
                        </span>
                    </div>
                ) : (
                    <span className="room-placeholder-badge"
                        style={{
                            background: "#6366f115",
                            color: "#6366f1",
                            border: "1px solid #6366f130",
                        }}>
                        Open board →
                    </span>
                )}
            </button>

            {/* Room Chat — coming soon */}
            <div className="room-placeholder-card">
                <div className="room-placeholder-icon" style={{ background: "#10b98115" }}>
                    <svg width={18} height={18} viewBox="0 0 24 24" fill="none"
                        stroke="#10b981" strokeWidth="1.6"
                        strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                </div>
                <p className="room-placeholder-name">Room Chat</p>
                <p className="room-placeholder-desc">Real-time messaging for your team</p>
                <span className="room-placeholder-badge"
                    style={{
                        background: "#10b98115",
                        color: "#10b981",
                        border: "1px solid #10b98130",
                    }}>
                    Coming soon
                </span>
            </div>

            {/* AI Agents — live, clickable */}
            <button
                className="room-placeholder-card room-placeholder-card-clickable"
                onClick={() => router.push("/agents/codebuddy")}
            >
                <div className="room-placeholder-icon" style={{ background: "#D9770615" }}>
                    <svg width={18} height={18} viewBox="0 0 24 24" fill="none"
                        stroke="#D97706" strokeWidth="1.6"
                        strokeLinecap="round" strokeLinejoin="round">
                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                    </svg>
                </div>
                <p className="room-placeholder-name">AI Agents</p>
                <p className="room-placeholder-desc">5 specialized AI agents ready to assist</p>
                <span className="room-placeholder-badge"
                    style={{
                        background: "#D9770615",
                        color: "#D97706",
                        border: "1px solid #D9770630",
                    }}>
                    Open agents →
                </span>
            </button>

        </div>
    );
}