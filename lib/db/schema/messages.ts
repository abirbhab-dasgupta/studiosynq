import { pgTable, text, timestamp, index } from "drizzle-orm/pg-core";
import { rooms } from "./rooms";

export const messages = pgTable("messages", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    roomId: text("room_id").notNull().references(() => rooms.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(),
    content: text("content").notNull(),
    agentName: text("agent_name"),
    parentId: text("parent_id"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
    index("messages_room_id_idx").on(table.roomId),
    index("messages_created_at_idx").on(table.createdAt),
]);