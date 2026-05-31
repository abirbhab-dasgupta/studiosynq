import { auth } from "@/lib/auth";
import { db, tasks, roomMembers } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";

// GET /api/rooms/[id]/tasks
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id: roomId } = await params;

  // verify requester is a room member
  const membership = await db
    .select()
    .from(roomMembers)
    .where(and(eq(roomMembers.roomId, roomId), eq(roomMembers.userId, session.user.id)))
    .limit(1);

  if (!membership.length) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const roomTasks = await db
    .select()
    .from(tasks)
    .where(eq(tasks.roomId, roomId));

  return Response.json(roomTasks);
}

// POST /api/rooms/[id]/tasks
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id: roomId } = await params;

  const membership = await db
    .select()
    .from(roomMembers)
    .where(and(eq(roomMembers.roomId, roomId), eq(roomMembers.userId, session.user.id)))
    .limit(1);

  if (!membership.length) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { title, description, priority, assigneeId, estimatedMinutes, status } = await req.json();

  if (!title?.trim()) {
    return Response.json({ error: "Title is required" }, { status: 400 });
  }

  const newTask = await db
    .insert(tasks)
    .values({
      title: title.trim(),
      description: description?.trim() ?? null,
      priority: priority ?? "medium",
      status: status ?? "todo",
      roomId,
      creatorId: session.user.id,
      assigneeId: assigneeId ?? null,
      estimatedMinutes: estimatedMinutes ?? null,
    })
    .returning();

  return Response.json(newTask[0], { status: 201 });
}