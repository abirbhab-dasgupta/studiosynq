"use client";

export const Ico = ({ d, size = 16, stroke = "currentColor" }: {
    d: string; size?: number; stroke?: string;
}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
        stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d={d} />
    </svg>
);

export const P = {
    home: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
    grid: "M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z",
    check: "M9 11l3 3L22 4 M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11",
    shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10",
    user: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8",
    code: "M16 18l6-6-6-6 M8 6l-6 6 6 6",
    chat: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
    search: "M21 21l-4.35-4.35 M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0",
    plus: "M12 5v14 M5 12h14",
    sun: "M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42 M12 7a5 5 0 1 0 0 10A5 5 0 0 0 12 7z",
    moon: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z",
    chevR: "M9 18l6-6-6-6",
    activity: "M22 12h-4l-3 9L9 3l-3 9H2",
    zap: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
    star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
    book: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8",
    logout: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9",
};

export const ThreeDots = ({ size = 16, stroke = "currentColor" }: { size?: number; stroke?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={stroke}>
        <circle cx="12" cy="5" r="1.5" />
        <circle cx="12" cy="12" r="1.5" />
        <circle cx="12" cy="19" r="1.5" />
    </svg>
);

export const Crown = ({ size = 16, stroke = "currentColor" }: { size?: number; stroke?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
        stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 20h20M5 20L3 8l5 4 4-6 4 6 5-4-2 12" />
    </svg>
);