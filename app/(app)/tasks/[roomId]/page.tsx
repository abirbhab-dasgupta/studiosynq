import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { TaskBoard } from "@/components/tasks/task-board";

type Props = {
    params: Promise<{ roomId: string }>;
};

export default async function TaskBoardPage({ params }: Props) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) redirect("/auth/sign-in");

    const { roomId } = await params;

    return <TaskBoard roomId={roomId} user={session.user} />;
}