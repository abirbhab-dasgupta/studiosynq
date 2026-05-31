import { auth } from "@/lib/auth";
import { db, tasks, roomMembers } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";


export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id: roomId, taskId } = await params;

  const membership = await db
    .select()
    .from(roomMembers)
    .where(and(eq(roomMembers.roomId, roomId), eq(roomMembers.userId, session.user.id)))
    .limit(1);

  if (!membership.length) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  // fetch task to verify it belongs to this room
  const existing = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.id, taskId), eq(tasks.roomId, roomId)))
    .limit(1);

  if (!existing.length) {
    return Response.json({ error: "Task not found" }, { status: 404 });
  }

  const { title, description, status, priority, assigneeId, estimatedMinutes } = await req.json();

  const updated = await db
    .update(tasks)
    .set({
      ...(title !== undefined && { title: title.trim() }),
      ...(description !== undefined && { description: description?.trim() ?? null }),
      ...(status !== undefined && { status }),
      ...(priority !== undefined && { priority }),
      ...(assigneeId !== undefined && { assigneeId: assigneeId ?? null }),
      ...(estimatedMinutes !== undefined && { estimatedMinutes: estimatedMinutes ?? null }),
    })
    .where(eq(tasks.id, taskId))
    .returning();

  return Response.json(updated[0]);
}

// DELETE /api/rooms/[id]/tasks/[taskId]
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id: roomId, taskId } = await params;

  const membership = await db
    .select()
    .from(roomMembers)
    .where(and(eq(roomMembers.roomId, roomId), eq(roomMembers.userId, session.user.id)))
    .limit(1);

  if (!membership.length) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const existing = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.id, taskId), eq(tasks.roomId, roomId)))
    .limit(1);

  if (!existing.length) {
    return Response.json({ error: "Task not found" }, { status: 404 });
  }

  // only the creator can delete
  if (existing[0].creatorId !== session.user.id) {
    return Response.json({ error: "Only the task creator can delete this task" }, { status: 403 });
  }

  await db.delete(tasks).where(eq(tasks.id, taskId));

  return new Response(null, { status: 204 });
}