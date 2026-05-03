"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type RoomInfo = {
    roomId: string;
    roomName: string;
    mode: "request" | "auto";
};

type Status = "loading" | "ready" | "submitting" | "pending" | "approved" | "rejected" | "already_member" | "error" | "invalid";

type Props = {
    token: string;
};

export function JoinPageClient({ token }: Props) {
    const router = useRouter();
    const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
    const [status, setStatus] = useState<Status>("loading");
    const [errorMsg, setErrorMsg] = useState("");

    // Fetch room info from token on mount
    useEffect(() => {
        fetch(`/api/join/${token}`)
            .then(async r => {
                const data = await r.json();
                if (!r.ok) {
                    setStatus("invalid");
                    setErrorMsg(data.error ?? "Invalid or expired invite link");
                } else {
                    setRoomInfo(data);
                    setStatus("ready");
                }
            })
            .catch(() => {
                setStatus("error");
                setErrorMsg("Something went wrong. Please try again.");
            });
    }, [token]);

    async function handleJoin() {
        setStatus("submitting");

        try {
            const res = await fetch(`/api/join/${token}`, { method: "POST" });

            if (res.status === 401) {
                router.push(`/auth/sign-in?redirect=/join/${token}`);
                return;
            }

            const data = await res.json();
            console.log("Join response:", data);

            if (data.status === "joined") {
                router.push(`/rooms/${data.roomId}`);
                return;
            }

            if (data.status === "already_member") {
                router.push(`/rooms/${data.roomId}`);
                return;
            }

            if (data.status === "pending") {
                setStatus("pending");
                return;
            }

            if (data.error) {
                setStatus("error");
                setErrorMsg(data.error);
                return;
            }

            setStatus("error");
            setErrorMsg("Something went wrong. Please try again.");

        } catch (err) {
            console.error("Join error:", err);
            setStatus("error");
            setErrorMsg("Something went wrong. Please try again.");
        }
    }

    return (
        <div className="join-page">
            {/* Apply theme from localStorage */}
            <script dangerouslySetInnerHTML={{
                __html: `
                try {
                    const t = localStorage.getItem('theme');
                    if (t === 'light') document.documentElement.classList.add('light');
                } catch(e) {}
            ` }} />

            <div className="join-card">
                {/* Logo */}
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div className="join-card-logo">
                        <img
                            src="/studiosynq-logo.jpg"
                            alt="Studiosynq"
                            style={{ width: 28, height: 28, borderRadius: 7, objectFit: "cover" }}
                        />
                    </div>
                    <span style={{
                        fontSize: 15, fontWeight: 500,
                        color: "var(--text)", letterSpacing: "-.2px",
                    }}>Studiosynq</span>
                </div>

                {/* Loading state */}
                {status === "loading" && (
                    <div style={{ textAlign: "center", padding: "20px 0" }}>
                        <p style={{ fontSize: 13, color: "var(--text-3)", fontFamily: "var(--font-mono)" }}>
                            Loading invite...
                        </p>
                    </div>
                )}

                {/* Invalid invite */}
                {status === "invalid" && (
                    <>
                        <div>
                            <p className="join-card-title">Invalid invite</p>
                            <p className="join-card-subtitle">{errorMsg}</p>
                        </div>
                        <button
                            className="join-btn-secondary"
                            onClick={() => router.push("/")}
                        >
                            Go to homepage
                        </button>
                    </>
                )}

                {/* Ready to join */}
                {status === "ready" && roomInfo && (
                    <>
                        <div>
                            <p className="join-card-title">You've been invited</p>
                            <p className="join-card-subtitle">
                                You have been invited to join a workspace on Studiosynq.
                            </p>
                        </div>

                        {/* Room info card */}
                        <div className="join-card-room">
                            <div className="join-card-room-icon">
                                <svg width={18} height={18} viewBox="0 0 24 24" fill="none"
                                    stroke="var(--amber)" strokeWidth="1.6"
                                    strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="3" width="7" height="7" />
                                    <rect x="14" y="3" width="7" height="7" />
                                    <rect x="3" y="14" width="7" height="7" />
                                    <rect x="14" y="14" width="7" height="7" />
                                </svg>
                            </div>
                            <div>
                                <p className="join-card-room-name">{roomInfo.roomName}</p>
                                <p className="join-card-room-mode">
                                    {roomInfo.mode === "auto"
                                        ? "Anyone with link can join"
                                        : "Requires owner approval"}
                                </p>
                            </div>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            <button
                                className="join-btn-primary"
                                onClick={handleJoin}
                            >
                                {roomInfo.mode === "auto"
                                    ? "Join room"
                                    : "Request to join"}
                            </button>
                            <button
                                className="join-btn-secondary"
                                onClick={() => router.push("/")}
                            >
                                Maybe later
                            </button>
                        </div>
                    </>
                )}

                {/* Submitting */}
                {status === "submitting" && (
                    <div style={{ textAlign: "center", padding: "20px 0" }}>
                        <p style={{ fontSize: 13, color: "var(--text-3)", fontFamily: "var(--font-mono)" }}>
                            Processing...
                        </p>
                    </div>
                )}

                {/* Pending approval */}
                {status === "pending" && (
                    <>
                        <div>
                            <p className="join-card-title">Request sent</p>
                            <p className="join-card-subtitle">
                                Your request to join <strong>{roomInfo?.roomName}</strong> has been sent.
                                The room owner will review your request shortly.
                            </p>
                        </div>

                        <div className="join-status-badge pending">
                            <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" strokeWidth="1.6"
                                strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                            </svg>
                            Waiting for approval
                        </div>

                        <button
                            className="join-btn-secondary"
                            onClick={() => router.push("/dashboard")}
                        >
                            Go to dashboard
                        </button>
                    </>
                )}

                {/* Error */}
                {status === "error" && (
                    <>
                        <div>
                            <p className="join-card-title">Something went wrong</p>
                            <p className="join-card-subtitle">{errorMsg}</p>
                        </div>
                        <button
                            className="join-btn-primary"
                            onClick={() => setStatus("ready")}
                        >
                            Try again
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}