"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type JoinRequest = {
    id: string;
    userId: string;
    name: string;
    email: string;
    image: string | null;
    avatarColor: string | null;
    createdAt: string;
};

type Props = {
    roomId: string;
};

export function RoomRequests({ roomId }: Props) {
    const queryClient = useQueryClient();

    const { data: requests = [] } = useQuery<JoinRequest[]>({
        queryKey: ["room-requests", roomId],
        queryFn: () => fetch(`/api/rooms/${roomId}/requests`).then(r => r.json()),
        refetchInterval: 5000,
    });

    const handleRequest = useMutation({
        mutationFn: ({ requestId, action }: { requestId: string; action: "approve" | "reject" }) =>
            fetch(`/api/rooms/${roomId}/requests/${requestId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action }),
            }).then(r => r.json()),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["room-requests", roomId] });
            queryClient.invalidateQueries({ queryKey: ["room", roomId] });
        },
    });

    if (requests.length === 0) return null;

    return (
        <div style={{
            background: "rgba(217,119,6,0.06)",
            border: "1px solid var(--amber-border)",
            borderRadius: 12, padding: "16px 20px",
            display: "flex", flexDirection: "column", gap: 12,
        }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{
                    width: 6, height: 6, borderRadius: "50%",
                    background: "var(--amber)",
                }} />
                <p style={{
                    fontSize: 12, fontWeight: 600,
                    color: "var(--amber)",
                    fontFamily: "var(--font-sans)",
                }}>
                    {requests.length} pending request{requests.length !== 1 ? "s" : ""}
                </p>
            </div>

            {requests.map(req => {
                const color = req.avatarColor ?? "#D97706";
                return (
                    <div key={req.id} style={{
                        display: "flex", alignItems: "center",
                        justifyContent: "space-between", gap: 12,
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            {req.image ? (
                                <img
                                    src={req.image}
                                    alt={req.name}
                                    style={{
                                        width: 32, height: 32,
                                        borderRadius: "50%",
                                        objectFit: "cover",
                                        border: "2px solid var(--border)",
                                    }}
                                />
                            ) : (
                                <div style={{
                                    width: 32, height: 32, borderRadius: "50%",
                                    background: color + "22",
                                    border: `2px solid ${color}55`,
                                    color: color, fontSize: 12, fontWeight: 600,
                                    display: "flex", alignItems: "center",
                                    justifyContent: "center",
                                    fontFamily: "var(--font-mono)",
                                    flexShrink: 0,
                                }}>
                                    {req.name.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div>
                                <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>
                                    {req.name}
                                </p>
                                <p style={{
                                    fontSize: 11, color: "var(--text-3)",
                                    fontFamily: "var(--font-mono)",
                                }}>
                                    {req.email}
                                </p>
                            </div>
                        </div>

                        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                            <button
                                onClick={() => handleRequest.mutate({ requestId: req.id, action: "approve" })}
                                disabled={handleRequest.isPending}
                                style={{
                                    height: 28, padding: "0 12px",
                                    background: handleRequest.isPending ? "#6b7280" : "#10b981",
                                    color: "#fff", border: "none", borderRadius: 6,
                                    fontSize: 11, fontWeight: 600,
                                    cursor: handleRequest.isPending ? "not-allowed" : "pointer",
                                    fontFamily: "var(--font-sans)",
                                    opacity: handleRequest.isPending ? 0.6 : 1,
                                    transition: "background .15s",
                                }}
                            >
                                {handleRequest.isPending ? "..." : "Approve"}
                            </button>
                            <button
                                onClick={() => handleRequest.mutate({ requestId: req.id, action: "reject" })}
                                disabled={handleRequest.isPending}
                                style={{
                                    height: 28, padding: "0 12px",
                                    background: "transparent",
                                    border: "1px solid rgba(239,68,68,0.3)",
                                    borderRadius: 6, fontSize: 11,
                                    color: "#ef4444",
                                    cursor: handleRequest.isPending ? "not-allowed" : "pointer",
                                    fontFamily: "var(--font-sans)",
                                    opacity: handleRequest.isPending ? 0.6 : 1,
                                }}
                            >
                                Reject
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}