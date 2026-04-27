import { pgTable, text, timestamp, index } from "drizzle-orm/pg-core";

export const agentLogs = pgTable("agent_logs", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id").notNull(),
    agentName: text("agent_name", {
        enum: ["codebuddy", "clarityagent", "researchbot", "designexpert", "docwriter"]
    }).notNull(),
    prompt: text("prompt").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
    index("agent_logs_user_id_idx").on(table.userId),
    index("agent_logs_created_at_idx").on(table.createdAt),
]);