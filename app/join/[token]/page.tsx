import { JoinPageClient } from "@/components/room/join-page-client";

type Props = {
    params: Promise<{ token: string }>;
};

export default async function JoinPage({ params }: Props) {
    const { token } = await params;
    return <JoinPageClient token={token} />;
}