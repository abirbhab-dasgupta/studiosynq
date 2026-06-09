"use client";

import { useEffect, useState, useRef } from "react";
import { X } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MemberProfile {
  id: string;
  name: string;
  image?: string | null;
  username?: string | null;
  bio?: string | null;
  email?: string | null;
  avatarColor?: string | null;
}

interface MemberProfileModalProps {
  userId: string | null;
  onClose: () => void;
}

type FetchState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error" }
  | { status: "ok"; profile: MemberProfile };

// ─── Component ────────────────────────────────────────────────────────────────

export function MemberProfileModal({ userId, onClose }: MemberProfileModalProps) {
  const [state, setState] = useState<FetchState>({ status: "idle" });
  const panelRef = useRef<HTMLDivElement>(null);

  const profile = state.status === "ok" ? state.profile : null;
  const loading = state.status === "loading";
  const error   = state.status === "error";

  // Fetch profile when userId changes
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    const run = async () => {
      setState({ status: "loading" });
      try {
        const r = await fetch(`/api/profile/${userId}`);
        if (!r.ok) throw new Error("not found");
        const data: MemberProfile = await r.json();
        if (!cancelled) setState({ status: "ok", profile: data });
      } catch {
        if (!cancelled) setState({ status: "error" });
      }
    };
    run();
    return () => { cancelled = true; };
  }, [userId]);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Close on outside click
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) onClose();
    }
    if (userId) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [userId, onClose]);

  if (!userId) return null;

  const initials = profile?.name
    ? profile.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  return (
    <>
      {/* Backdrop */}
      <div className="member-modal-backdrop" aria-hidden="true" />

      {/* Panel */}
      <div ref={panelRef} role="dialog" aria-modal="true" className="member-modal-panel">

        {/* Close */}
        <button onClick={onClose} aria-label="Close" className="member-modal-close">
          <X size={14} />
        </button>

        {/* Loading */}
        {loading && (
          <div className="member-modal-loading">
            {[0, 1, 2].map(i => (
              <div key={i} className="member-modal-dot" style={{ animationDelay: `${i * 0.2}s` }} />
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="member-modal-error">
            <p className="member-modal-error-title">Couldn&apos;t load profile</p>
            <p className="member-modal-error-sub">Try again later</p>
          </div>
        )}

        {/* Profile */}
        {!loading && !error && profile && (
          <>
            {/* Banner */}
            <div className="member-modal-banner">
              {profile.image ? (
                <img src={profile.image} alt={profile.name} className="member-modal-avatar" />
              ) : (
                <div className="member-modal-avatar member-modal-avatar-fallback" style={{ background: profile.avatarColor ?? "var(--amber)" }}>
                  {initials}
                </div>
              )}
              <h2 className="member-modal-name">{profile.name}</h2>
              {profile.username && (
                <p className="member-modal-username">@{profile.username}</p>
              )}
            </div>

            {/* Body */}
            <div className="member-modal-body">
              {profile.bio ? (
                <div className="member-modal-field">
                  <p className="member-modal-field-label">Bio</p>
                  <p className="member-modal-field-value">{profile.bio}</p>
                </div>
              ) : (
                <p className="member-modal-no-bio">No bio yet.</p>
              )}

              {profile.email && (
                <div className="member-modal-field member-modal-field-bordered">
                  <p className="member-modal-field-label">Email</p>
                  <p className="member-modal-field-value member-modal-field-mono">{profile.email}</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}