"use client";

const FEATURES = [
    {
        name: "Task Board",
        description: "Kanban board for tracking tasks",
        icon: "M9 11l3 3L22 4 M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11",
        accent: "#6366f1",
    },
    {
        name: "Room Chat",
        description: "Real-time messaging for your team",
        icon: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
        accent: "#10b981",
    },
    {
        name: "AI Agents",
        description: "5 specialized AI agents ready to assist",
        icon: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
        accent: "#D97706",
    },
];

export function RoomPlaceholders() {
    return (
        <div className="room-placeholder-grid">
            {FEATURES.map(feature => (
                <div key={feature.name} className="room-placeholder-card">
                    <div
                        className="room-placeholder-icon"
                        style={{ background: feature.accent + "18" }}
                    >
                        <svg
                            width={18} height={18}
                            viewBox="0 0 24 24" fill="none"
                            stroke={feature.accent}
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d={feature.icon} />
                        </svg>
                    </div>
                    <p className="room-placeholder-name">{feature.name}</p>
                    <p className="room-placeholder-desc">{feature.description}</p>
                    <span
                        className="room-placeholder-badge"
                        style={{
                            background: feature.accent + "15",
                            color: feature.accent,
                            border: `1px solid ${feature.accent}30`,
                        }}
                    >
                        Coming soon
                    </span>
                </div>
            ))}
        </div>
    );
}