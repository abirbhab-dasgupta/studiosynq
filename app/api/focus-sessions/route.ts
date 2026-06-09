import { NextRequest } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { focusSessions } from "@/lib/db/index";
import { and, eq, gte } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const roomId = searchParams.get("roomId");

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const conditions = [
    eq(focusSessions.userId, session.user.id),
    gte(focusSessions.startedAt, startOfDay),
  ];

  const rows = await db
    .select()
    .from(focusSessions)
    .where(and(...conditions))
    .orderBy(focusSessions.startedAt);

  const focusOnly = rows.filter((r) => r.type === "focus");

  return Response.json({
    sessions: rows,
    stats: {
      sessionCount: focusOnly.length,
      focusMinutes: focusOnly.reduce((acc, r) => acc + (r.durationMinutes ?? 0), 0),
      streak:       focusOnly.filter((r) => r.completed).length,
    },
  });
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { roomId, type, durationMinutes, completed } = body;

  if (!type || !durationMinutes) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  const now      = new Date();
  const startedAt = new Date(now.getTime() - durationMinutes * 60 * 1000);

  const [inserted] = await db
    .insert(focusSessions)
    .values({
      userId: session.user.id,
      roomId: roomId ?? null,
      type,
      durationMinutes,
      completed: completed ?? true,
      startedAt,
      endedAt: now,
    })
    .returning();

  return Response.json({ session: inserted });
}