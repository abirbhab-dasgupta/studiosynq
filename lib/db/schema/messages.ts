import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { rooms } from "./rooms";

export const messages = pgTable("messages", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    roomId: text("room_id").notNull().references(() => rooms.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});