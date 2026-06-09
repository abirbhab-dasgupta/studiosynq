import { NextRequest } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { roomMembers } from "@/lib/db/index";
import { user } from "@/lib/db/schema/auth";
import { eq } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id: roomId } = await params;

  const rows = await db
    .select({ id: user.id, name: user.name, image: user.image })
    .from(roomMembers)
    .innerJoin(user, eq(user.id, roomMembers.userId))
    .where(eq(roomMembers.roomId, roomId));

  return Response.json({ members: rows });
}