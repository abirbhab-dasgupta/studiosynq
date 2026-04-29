"use client";

import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Ico } from "@/components/dashboard/icons";
import { RoomMembers } from "./room-members";
import { RoomPlaceholders } from "./room-placeholders";
import { RoomInvite } from "./room-invite";
import { RoomRequests } from "./room-requests";

type Member = {
    userId: string;
    joinedAt: string;
    name: string;
    image: string | null;
    avatarColor: string | null;
};

type Room = {
    id: string;
    name: string;
    isActive: boolean;
    createdBy: string;
    members: Member[];
};

type Props = {
    roomId: string;
    user: { id: string; name: string; email: string };
};

export function RoomClient({ roomId, user }: Props) {
    const router = useRouter();

    const [theme, setTheme] = useState<"dark" | "light">(() => {
        if (typeof window === "undefined") return "dark";
        return (localStorage.getItem("theme") as "dark" | "light") ?? "dark";
    });

    useEffect(() => {
        const isLight = document.documentElement.classList.contains("light");
        setTheme(isLight ? "light" : "dark");

        const observer = new MutationObserver(() => {
            const isLight = document.documentElement.classList.contains("light");
            setTheme(isLight ? "light" : "dark");
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class"],
        });

        return () => observer.disconnect();
    }, []);

    const { data: room, isLoading } = useQuery<Room>({
        queryKey: ["room", roomId],
        queryFn: () => fetch(`/api/rooms/${roomId}`).then(r => r.json()),
        refetchInterval: 5000,
    });

    if (isLoading) {
        return (
            <div style={{
                flex: 1, display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: 14,
                color: "var(--text-2)", fontFamily: "var(--font-sans)",
            }}>
                Loading room...
            </div>
        );
    }

    if (!room || (room as any).error) {
        return (
            <div style={{
                flex: 1, display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: 14,
                color: "var(--text-2)", fontFamily: "var(--font-sans)",
            }}>
                Room not found.
            </div>
        );
    }

    return (
        <div className="room-workspace">

            {/* Header */}
            <div className="room-workspace-header">
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <button
                        className="room-workspace-back"
                        onClick={() => router.back()}
                    >
                        <Ico d="M19 12H5 M12 19l-7-7 7-7" size={13} stroke="var(--text-2)" />
                    </button>
                    <div>
                        <p className="room-workspace-title">{room.name}</p>
                        <p className="room-workspace-subtitle">
                            {room.members.length} member{room.members.length !== 1 ? "s" : ""}
                        </p>
                    </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {/* Invite button — only show to room owner */}
                    {room.createdBy === user.id && (
                        <RoomInvite roomId={room.id} />
                    )}
                    <div className="room-workspace-live">
                        <div className="room-workspace-live-dot" />
                        <span className="room-workspace-live-label">Live</span>
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className="room-workspace-body">
                {/* Pending requests — only visible to room owner */}
                {room.createdBy === user.id && (
                    <RoomRequests roomId={room.id} />
                )}
                <RoomMembers members={room.members} currentUserId={user.id} />
                <RoomPlaceholders />
            </div>
        </div>
    );
}