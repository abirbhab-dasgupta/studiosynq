"use client";

import { Ico, P } from "@/components/dashboard/icons";

type Props = {
    onConfirm: () => void;
    onCancel: () => void;
    isPending: boolean;
};

export function DeleteConfirm({ onConfirm, onCancel, isPending }: Props) {
    return (
        <div className="rooms-modal-backdrop">
            <div className="rooms-modal">
                <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: "rgba(239,68,68,0.1)",
                    display: "flex", alignItems: "center",
                    justifyContent: "center", marginBottom: 4,
                }}>
                    <Ico d={P.grid} size={16} stroke="#ef4444" />
                </div>
                <p className="rooms-modal-title">Delete room?</p>
                <p className="rooms-modal-subtitle">
                    This will permanently delete the room and all its data. This cannot be undone.
                </p>
                <div className="rooms-modal-actions">
                    <button className="rooms-modal-cancel" onClick={onCancel}>
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isPending}
                        style={{
                            flex: 1, height: 36,
                            background: "#ef4444", border: "none",
                            borderRadius: 8, fontSize: 13, fontWeight: 600,
                            color: "#fff", cursor: "pointer",
                            fontFamily: "var(--font-sans)",
                            opacity: isPending ? 0.7 : 1,
                        }}
                    >
                        {isPending ? "Deleting..." : "Delete room"}
                    </button>
                </div>
            </div>
        </div>
    );
}