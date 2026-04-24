import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const agentLogs = pgTable("agent_logs", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id").notNull(),
    agentName: text("agent_name", {
        enum: ["codebuddy", "clarityagent", "researchbot", "designexpert", "docwriter"]
    }).notNull(),
    prompt: text("prompt").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});