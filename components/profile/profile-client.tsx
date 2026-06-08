"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Ico, P } from "@/components/dashboard/icons";

type Profile = {
    id: string;
    name: string;
    email: string;
    username: string | null;
    image: string | null;
    bio: string | null;
    avatarColor: string | null;
};

type Props = {
    user: { id: string; name: string; email: string };
};

const AVATAR_COLORS = [
    "#D97706", "#10b981", "#6366f1", "#ec4899",
    "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6",
];

export function ProfileClient({ user }: Props) {
    const queryClient = useQueryClient();
    const fileInputRef = useRef<HTMLInputElement>(null);


    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [bio, setBio] = useState("");
    const [avatarColor, setAvatarColor] = useState("#D97706");
    const [uploading, setUploading] = useState(false);
    const [saved, setSaved] = useState(false);

    const { data: profile } = useQuery<Profile>({
        queryKey: ["profile"],
        queryFn: () => fetch("/api/profile").then(r => r.json()),
    });

    useEffect(() => {
        if (profile) {
            setName(profile.name ?? "");
            setUsername(profile.username ?? "");
            setBio(profile.bio ?? "");
            setAvatarColor(profile.avatarColor ?? "#D97706");
        }
    }, [profile]);



    const saveProfile = useMutation({
        mutationFn: (data: Partial<Profile>) =>
            fetch("/api/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            }).then(r => r.json()),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["profile"] });
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        },
    });

    async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (data.url) {
            await saveProfile.mutateAsync({ image: data.url });
            queryClient.invalidateQueries({ queryKey: ["profile"] });
        }
        setUploading(false);
    }

    const initials = (profile?.name ?? user.name).charAt(0).toUpperCase();

    // All styling done via inline style using CSS vars — avoids Tailwind v4 parsing issues
    const card: React.CSSProperties = {
        background: "var(--bg3)",
        border: "1px solid var(--border)",
        borderRadius: 16,
        padding: 24,
    };

    const inputStyle: React.CSSProperties = {
        height: 40,
        padding: "0 12px",
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 8,
        fontSize: 14,
        color: "var(--text)",
        fontFamily: "var(--font-sans)",
        outline: "none",
        width: "100%",
        boxShadow: "none",
    };

    return (
        <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)", fontFamily: "var(--font-sans)" }}>

            <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "16px 24px",
            }}>
                <p className="rooms-page-title">
                    Profile settings
                </p>
                <button
                    onClick={() => saveProfile.mutate({ name, username, bio, avatarColor })}
                    disabled={saveProfile.isPending}
                    style={{
                        height: 36, padding: "0 20px",
                        background: saved ? "#10b981" : "var(--amber)",
                        color: "#fff", border: "none", borderRadius: 8,
                        fontSize: 13, fontWeight: 600,
                        cursor: saveProfile.isPending ? "not-allowed" : "pointer",
                        fontFamily: "var(--font-sans)",
                        opacity: saveProfile.isPending ? 0.7 : 1,
                        whiteSpace: "nowrap",
                        transition: "background .2s",
                    }}
                >
                    {saved ? "Saved ✓" : saveProfile.isPending ? "Saving..." : "Save changes"}
                </button>
            </div>

            {/* Content */}
            <div className="profile-content">

                {/* Avatar card */}
                <div style={card}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 20 }}>
                        Avatar
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
                        {profile?.image ? (
                            <img
                                src={profile.image}
                                alt="avatar"
                                style={{
                                    width: 80, height: 80, borderRadius: "50%",
                                    objectFit: "cover",
                                    border: "2px solid var(--border)",
                                    flexShrink: 0,
                                }}
                            />
                        ) : (
                            <div style={{
                                width: 80, height: 80, borderRadius: "50%",
                                background: avatarColor + "22",
                                border: `2px solid ${avatarColor}55`,
                                color: avatarColor,
                                display: "flex", alignItems: "center",
                                justifyContent: "center",
                                fontSize: 26, fontWeight: 600,
                                fontFamily: "var(--font-mono)",
                                flexShrink: 0,
                            }}>
                                {initials}
                            </div>
                        )}

                        <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
                            <p style={{ fontSize: 12, color: "var(--text-2)" }}>
                                Upload a photo or pick an accent color below.
                            </p>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                style={{
                                    display: "flex", alignItems: "center", gap: 6,
                                    height: 32, padding: "0 12px", width: "fit-content",
                                    background: "var(--surface)",
                                    border: "1px solid var(--border)",
                                    borderRadius: 8, fontSize: 12, fontWeight: 500,
                                    color: "var(--text-2)", cursor: "pointer",
                                    fontFamily: "var(--font-sans)",
                                    opacity: uploading ? 0.5 : 1,
                                }}
                            >
                                <Ico d={P.plus} size={12} stroke="var(--text-2)" />
                                {uploading ? "Uploading..." : "Change photo"}
                            </button>
                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                {AVATAR_COLORS.map(color => (
                                    <button
                                        key={color}
                                        onClick={() => {
                                            setAvatarColor(color);
                                            saveProfile.mutate({ avatarColor: color });
                                        }}
                                        style={{
                                            width: 24, height: 24, borderRadius: "50%",
                                            background: color, cursor: "pointer",
                                            border: avatarColor === color
                                                ? "2.5px solid var(--text)"
                                                : "2px solid transparent",
                                            transition: "transform .15s",
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        style={{ display: "none" }}
                    />
                </div>

                {/* Personal info card */}
                <div style={{ ...card, display: "flex", flexDirection: "column", gap: 20 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>
                        Personal info
                    </p>

                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <label style={{ fontSize: 12, fontWeight: 500, color: "var(--text-2)" }}>
                            Display name
                        </label>
                        <input
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Your name"
                            style={inputStyle}
                        />
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <label style={{ fontSize: 12, fontWeight: 500, color: "var(--text-2)" }}>
                            Username
                        </label>
                        <div style={{ position: "relative" }}>
                            <span style={{
                                position: "absolute", left: 12, top: "50%",
                                transform: "translateY(-50%)",
                                fontSize: 14, color: "var(--text-3)",
                                fontFamily: "var(--font-mono)",
                                pointerEvents: "none",
                            }}>@</span>
                            <input
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                placeholder="username"
                                style={{ ...inputStyle, paddingLeft: 28, fontFamily: "var(--font-mono)" }}
                            />
                        </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <label style={{ fontSize: 12, fontWeight: 500, color: "var(--text-2)" }}>
                            Email
                        </label>
                        <input
                            value={profile?.email ?? user.email}
                            disabled
                            style={{ ...inputStyle, color: "var(--text-3)", cursor: "not-allowed" }}
                        />
                        <span style={{ fontSize: 11, color: "var(--text-3)" }}>
                            Email cannot be changed.
                        </span>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <label style={{ fontSize: 12, fontWeight: 500, color: "var(--text-2)" }}>
                            Bio
                        </label>
                        <textarea
                            value={bio}
                            onChange={e => setBio(e.target.value)}
                            placeholder="Tell your teammates about yourself..."
                            rows={4}
                            style={{
                                ...inputStyle,
                                height: "auto",
                                padding: "10px 12px",
                                resize: "vertical",
                                lineHeight: 1.6,
                            }}
                        />
                    </div>
                </div>

                

            </div>
        </div>
    );
}