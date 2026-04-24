export const DARK = {
    bg: "#0C0B09", bg2: "#131210", bg3: "#1A1814", bg4: "#222019",
    surface: "rgba(255,255,255,0.032)", surfaceH: "rgba(255,255,255,0.058)",
    border: "rgba(255,255,255,0.07)", borderM: "rgba(255,255,255,0.11)",
    text: "#EDE8DF", text2: "#9E9589", text3: "#524E46",
    amber: "#D97706", amberLt: "#F59E0B",
    amberFaint: "rgba(217,119,6,0.07)", amberBorder: "rgba(217,119,6,0.18)",
};

export const LIGHT = {
    bg: "#F9F8F5", bg2: "#F2F0EB", bg3: "#E9E6DF", bg4: "#DDD9D0",
    surface: "rgba(0,0,0,0.025)", surfaceH: "rgba(0,0,0,0.05)",
    border: "rgba(0,0,0,0.07)", borderM: "rgba(0,0,0,0.12)",
    text: "#1C1A16", text2: "#6B6357", text3: "#A09790",
    amber: "#B45309", amberLt: "#D97706",
    amberFaint: "rgba(180,100,0,0.06)", amberBorder: "rgba(180,100,0,0.16)",
};

export type Theme = typeof DARK;