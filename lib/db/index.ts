import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as authSchema from "./schema/auth";
import * as roomsSchema from "./schema/rooms";
import * as tasksSchema from "./schema/tasks";
import * as sessionsSchema from "./schema/sessions";
import * as agentLogsSchema from "./schema/agent_logs";
import * as messagesSchema from "./schema/messages";

const sql = neon(process.env.DATABASE_URL!);

export const db = drizzle(sql, {
    schema: {
        ...authSchema,
        ...roomsSchema,
        ...tasksSchema,
        ...sessionsSchema,
        ...agentLogsSchema,
        ...messagesSchema,
    },
});

export * from "./schema/auth";
export * from "./schema/rooms";
export * from "./schema/tasks";
export * from "./schema/sessions";
export * from "./schema/agent_logs";
export * from "./schema/messages";