"use client";

type Props = {
    value: string;
    onChange: (v: string) => void;
    onSubmit: () => void;
    onCancel: () => void;
    isPending: boolean;
};

export function CreateRoomForm({ value, onChange, onSubmit, onCancel, isPending }: Props) {
    return (
        <div className="rooms-modal-backdrop">
            <div className="rooms-modal">
                <p className="rooms-modal-title">Create a new room</p>
                <p style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 4 }}>
                    Give your room a name to get started.
                </p>
                <input
                    autoFocus
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && value && onSubmit()}
                    placeholder="e.g. Frontend Sprint, API Design..."
                    className="rooms-modal-input"
                />
                <div className="rooms-modal-actions">
                    <button className="rooms-modal-cancel" onClick={onCancel}>
                        Cancel
                    </button>
                    <button
                        className="rooms-modal-confirm"
                        onClick={onSubmit}
                        disabled={isPending || !value}
                    >
                        {isPending ? "Creating..." : "Create room"}
                    </button>
                </div>
            </div>
        </div>
    );
}