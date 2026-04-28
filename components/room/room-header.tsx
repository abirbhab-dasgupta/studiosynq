"use client";

import { useRouter } from "next/navigation";
import { Ico } from "@/components/dashboard/icons";

type Props = {
    name: string;
    memberCount: number;
};

export function RoomHeader({ name, memberCount }: Props) {
    const router = useRouter();

    return (
        <div className="room-workspace-header">
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <button
                    className="room-workspace-back"
                    onClick={() => router.back()}
                >
                    <Ico d="M19 12H5 M12 19l-7-7 7-7" size={13} stroke="var(--text-2)" />
                </button>
                <div>
                    <p className="room-workspace-title">{name}</p>
                    <p className="room-workspace-subtitle">
                        {memberCount} member{memberCount !== 1 ? "s" : ""}
                    </p>
                </div>
            </div>

            <div className="room-workspace-live">
                <div className="room-workspace-live-dot" />
                <span className="room-workspace-live-label">Live</span>
            </div>
        </div>
    );
}