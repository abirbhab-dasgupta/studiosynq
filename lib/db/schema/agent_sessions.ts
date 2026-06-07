import { pgTable, text, timestamp, index } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const agentSessions = pgTable("agent_sessions", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    agentName: text("agent_name", {
        enum: ["codebuddy", "clarityagent", "researchbot", "designexpert", "docwriter"]
    }).notNull(),
    title: text("title").notNull().default("New chat"),
    messages: text("messages").notNull().default("[]"), // JSON string
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
    index("agent_sessions_user_id_idx").on(table.userId),
    index("agent_sessions_agent_name_idx").on(table.agentName),
]);