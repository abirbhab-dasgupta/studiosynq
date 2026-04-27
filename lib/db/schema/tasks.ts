import { pgTable, text, timestamp, integer, index } from "drizzle-orm/pg-core";
import { rooms } from "./rooms";

export const tasks = pgTable("tasks", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    title: text("title").notNull(),
    status: text("status", { enum: ["todo", "in_progress", "done"] }).default("todo").notNull(),
    roomId: text("room_id").notNull().references(() => rooms.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(),
    estimatedMinutes: integer("estimated_minutes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
    index("tasks_user_id_idx").on(table.userId),
    index("tasks_room_id_idx").on(table.roomId),
]);