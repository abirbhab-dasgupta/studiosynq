import { NextRequest } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import Pusher from "pusher";

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? "ap2",
  useTLS: true,
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id: roomId } = await params;
  const body = await req.json();
  const { isRunning, mode } = body;

  await pusher.trigger(`focus-${roomId}`, "focus:state", {
    userId: session.user.id,
    userName: session.user.name,
    isRunning,
    mode,
  });

  return Response.json({ ok: true });
}