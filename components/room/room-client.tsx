"use client";

import { RoomChat } from "./room-chat";

type Props = {
    roomId: string;
    user: { id: string; name: string; email: string };
};

export function RoomClient({ roomId, user }: Props) {
    return <RoomChat roomId={roomId} user={user} />;
}