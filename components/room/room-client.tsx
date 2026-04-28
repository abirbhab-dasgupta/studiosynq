"use client";

import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { RoomHeader } from "./room-header";
import { RoomMembers } from "./room-members";
import { RoomPlaceholders } from "./room-placeholders";

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
            <RoomHeader name={room.name} memberCount={room.members.length} />
            <div className="room-workspace-body">
                <RoomMembers members={room.members} currentUserId={user.id} />
                <RoomPlaceholders />
            </div>
        </div>
    );
}