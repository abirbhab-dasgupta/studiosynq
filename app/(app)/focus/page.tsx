import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { rooms, roomMembers, focusSessions } from "@/lib/db/index";
import { user } from "@/lib/db/schema/auth";
import { and, eq, gte, desc } from "drizzle-orm";
import { FocusTimer } from "@/components/focus/focus-timer";
import type { SidebarMember, TodayStats, RecentSession } from "@/components/focus/focus-sidebar";

interface FocusPageProps {
  searchParams: Promise<{ roomId?: string }>;
}

export default async function FocusPage({ searchParams }: FocusPageProps) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/sign-in");

  const { roomId } = await searchParams;

  // ── All rooms user is a member of ─────────────────────────────────────────
  const membershipRows = await db
    .select({ roomId: roomMembers.roomId, roomName: rooms.name })
    .from(roomMembers)
    .innerJoin(rooms, eq(rooms.id, roomMembers.roomId))
    .where(eq(roomMembers.userId, session.user.id));

  const allRooms = membershipRows.map((r) => ({ id: r.roomId, name: r.roomName }));

  // ── Resolve active room ───────────────────────────────────────────────────
  let resolvedRoomId   = "solo";
  let resolvedRoomName = "Solo";

  if (roomId) {
    const match = allRooms.find((r) => r.id === roomId);
    if (match) { resolvedRoomId = match.id; resolvedRoomName = match.name; }
  }

  if (resolvedRoomId === "solo" && allRooms.length > 0) {
    resolvedRoomId   = allRooms[0].id;
    resolvedRoomName = allRooms[0].name;
  }

  // ── Members of resolved room ──────────────────────────────────────────────
  let members: SidebarMember[];

  if (resolvedRoomId !== "solo") {
    const rows = await db
      .select({ id: user.id, name: user.name, image: user.image })
      .from(roomMembers)
      .innerJoin(user, eq(user.id, roomMembers.userId))
      .where(eq(roomMembers.roomId, resolvedRoomId));

    members = rows.map((r) => ({
      id: r.id, name: r.name, image: r.image ?? null, online: false, focusing: false,
    }));
  } else {
    members = [{
      id: session.user.id, name: session.user.name,
      image: session.user.image ?? null, online: true, focusing: false,
    }];
  }

  // ── Today's stats ─────────────────────────────────────────────────────────
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const todaySessions = await db
    .select()
    .from(focusSessions)
    .where(and(eq(focusSessions.userId, session.user.id), gte(focusSessions.startedAt, startOfDay)))
    .orderBy(desc(focusSessions.startedAt));

  const focusOnly = todaySessions.filter((s) => s.type === "focus");
  const stats: TodayStats = {
    sessionCount: focusOnly.length,
    focusMinutes: focusOnly.reduce((acc, s) => acc + (s.durationMinutes ?? 0), 0),
    streak:       focusOnly.filter((s) => s.completed).length,
  };

  const recentSessions: RecentSession[] = todaySessions.slice(0, 10).map((s) => ({
    id:              s.id,
    type:            s.type as RecentSession["type"],
    durationMinutes: s.durationMinutes ?? 0,
    completed:       s.completed,
  }));

  return (
    <div className="focus-page">
      {/* FocusTimer renders its own subheader with room switcher */}
      <div className="focus-page-body">
        <FocusTimer
          roomId={resolvedRoomId}
          roomName={resolvedRoomName}
          rooms={allRooms}
          currentUserId={session.user.id}
          currentUserName={session.user.name}
          initialMembers={members}
          initialStats={stats}
          initialRecent={recentSessions}
        />
      </div>
    </div>
  );
}