"use client";

import { Ico, P } from "./icons";
import { Theme } from "./tokens";

// hamburger icon path
const MENU = "M3 12h18 M3 6h18 M3 18h18";

type Props = {
    T: Theme;
    theme: "dark" | "light";
    setTheme: (t: "dark" | "light") => void;
    isMobile: boolean;
    onMenuClick: () => void;
};

export function Topbar({ T, theme, setTheme, isMobile, onMenuClick }: Props) {
    const s = (obj: React.CSSProperties): React.CSSProperties => obj;

    return (
        <header style={s({
            height: 56, flexShrink: 0,
            background: T.bg2, borderBottom: `1px solid ${T.border}`,
            display: "flex", alignItems: "center", gap: 10, padding: "0 20px",
        })}>
            {/* Hamburger button — only visible on mobile */}
            {isMobile && (
                <button
                    onClick={onMenuClick}
                    style={s({
                        width: 34, height: 34,
                        background: T.surface, border: `1px solid ${T.border}`,
                        borderRadius: 8, display: "flex", alignItems: "center",
                        justifyContent: "center", cursor: "pointer", flexShrink: 0,
                    })}>
                    <Ico d={MENU} size={15} stroke={T.text2} />
                </button>
            )}

            {/* Search bar — hidden on mobile to save space */}
            {!isMobile && (
                <div style={s({ position: "relative", flex: 1, maxWidth: 260 })}>
                    <span style={s({
                        position: "absolute", left: 10, top: "50%",
                        transform: "translateY(-50%)", pointerEvents: "none",
                    })}>
                        <Ico d={P.search} size={13} stroke={T.text3} />
                    </span>
                    <input type="text" placeholder="Search workspace…" style={s({
                        width: "100%", height: 32,
                        background: T.surface, border: `1px solid ${T.border}`,
                        borderRadius: 8, padding: "0 10px 0 30px",
                        fontSize: 13, color: T.text,
                        fontFamily: "'DM Sans',sans-serif", outline: "none",
                    })} />
                </div>
            )}

            <div style={s({ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto" })}>
                <button
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    style={s({
                        width: 34, height: 34,
                        background: T.surface, border: `1px solid ${T.border}`,
                        borderRadius: 8, display: "flex", alignItems: "center",
                        justifyContent: "center", cursor: "pointer",
                    })}>
                    <Ico d={theme === "dark" ? P.sun : P.moon} size={14} stroke={T.text2} />
                </button>
            </div>
        </header>
    );
}