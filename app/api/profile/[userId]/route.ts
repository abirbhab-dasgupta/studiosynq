import { NextRequest } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema/auth";
import { eq } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { userId } = await params;

  const [profile] = await db
    .select({
      id:              user.id,
      name:            user.name,
      email:           user.email,
      image:           user.image,
      username:        user.username,
      displayUsername: user.displayUsername,
      bio:             user.bio,
      avatarColor:     user.avatarColor,
    })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  if (!profile) return Response.json({ error: "Not found" }, { status: 404 });

  const isSelf = session.user.id === userId;

  return Response.json({
    id:          profile.id,
    name:        profile.name,
    image:       profile.image       ?? null,
    username:    profile.displayUsername ?? profile.username ?? null,
    bio:         profile.bio         ?? null,
    avatarColor: profile.avatarColor ?? "#D97706",
    // email only for self
    email:       isSelf ? profile.email : null,
  });
}