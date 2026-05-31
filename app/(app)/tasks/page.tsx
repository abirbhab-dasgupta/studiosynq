import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { TasksRoomPicker } from "@/components/tasks/tasks-room-picker";

export default async function TasksPage() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) redirect("/auth/sign-in");

    return <TasksRoomPicker user={session.user} />;
}