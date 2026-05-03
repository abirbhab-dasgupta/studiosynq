import { pgTable, text, boolean, timestamp, index } from "drizzle-orm/pg-core";

export const notifications = pgTable("notifications", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id").notNull(),
    type: text("type", { enum: ["approved", "rejected"] }).notNull(),
    message: text("message").notNull(),
    roomName: text("room_name"),
    roomId: text("room_id"),
    isRead: boolean("is_read").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
    index("notifications_user_id_idx").on(table.userId),
    index("notifications_created_at_idx").on(table.createdAt),
]);