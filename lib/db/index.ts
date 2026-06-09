import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as authSchema from "./schema/auth";
import * as roomsSchema from "./schema/rooms";
import * as tasksSchema from "./schema/tasks";
import * as sessionsSchema from "./schema/focus";
import * as agentLogsSchema from "./schema/agent_logs";
import * as messagesSchema from "./schema/messages";
import * as roomInvitesSchema from "./schema/room_invites";
import * as roomJoinRequestsSchema from "./schema/room_join_requests";
import * as notificationsSchema from "./schema/notifications";
import * as agentSessionsSchema from "./schema/agent_sessions";

const sql = neon(process.env.DATABASE_URL!);

export const db = drizzle(sql, {
    schema: {
        ...authSchema,
        ...roomsSchema,
        ...tasksSchema,
        ...sessionsSchema,
        ...agentLogsSchema,
        ...messagesSchema,
        ...roomInvitesSchema,
        ...roomJoinRequestsSchema,
        ...notificationsSchema,
        ...agentSessionsSchema,
    },
});

export * from "./schema/auth";
export * from "./schema/rooms";
export * from "./schema/tasks";
export * from "./schema/focus";
export * from "./schema/agent_logs";
export * from "./schema/messages";
export * from "./schema/room_invites";
export * from "./schema/room_join_requests";
export * from "./schema/notifications";
export * from "./schema/agent_sessions";