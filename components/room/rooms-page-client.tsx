"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Ico, P } from "@/components/dashboard/icons";
import { RoomCard } from "./room-card";
import { CreateRoomForm } from "./create-room-form";
import { DeleteConfirm } from "./delete-confirm";

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
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

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

    return (
        <div className="rooms-page">

            {deleteConfirm && (
                <DeleteConfirm
                    onConfirm={() => deleteRoom.mutate(deleteConfirm)}
                    onCancel={() => setDeleteConfirm(null)}
                    isPending={deleteRoom.isPending}
                />
            )}

            {/* Header */}
            <div className="rooms-page-header">
                <div>
                    <p className="rooms-page-label">Workspace</p>
                    <h1 className="rooms-page-title">Your Rooms</h1>
                </div>
                <button
                    className="rooms-create-btn"
                    onClick={() => setCreating(true)}
                >
                    <Ico d={P.plus} size={13} stroke="#fff" />
                    New Room
                </button>
            </div>

            {/* Create form */}
            {creating && (
                <CreateRoomForm
                    value={newRoomName}
                    onChange={setNewRoomName}
                    onSubmit={() => newRoomName && createRoom.mutate(newRoomName)}
                    onCancel={() => { setCreating(false); setNewRoomName(""); }}
                    isPending={createRoom.isPending}
                />
            )}

            {/* Empty state */}
            {rooms.length === 0 && !creating ? (
                <div className="rooms-empty">
                    <div className="rooms-empty-icon">
                        <Ico d={P.grid} size={20} stroke="var(--text-3)" />
                    </div>
                    <p className="rooms-empty-title">No rooms yet</p>
                    <p className="rooms-empty-subtitle">
                        Create a room to start collaborating with your team and AI agents.
                    </p>
                    <button
                        className="rooms-create-btn"
                        onClick={() => setCreating(true)}
                    >
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
                            onDelete={setDeleteConfirm}
                            onUpdate={(id, name) => updateRoom.mutate({ id, name })}
                            isUpdating={updateRoom.isPending}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}