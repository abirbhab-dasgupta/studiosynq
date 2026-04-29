import { pgTable, text, timestamp, index } from "drizzle-orm/pg-core";
import { rooms } from "./rooms";

export const roomJoinRequests = pgTable("room_join_requests", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    roomId: text("room_id").notNull().references(() => rooms.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(),
    status: text("status", { enum: ["pending", "approved", "rejected"] }).default("pending").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
    index("room_join_requests_room_id_idx").on(table.roomId),
    index("room_join_requests_user_id_idx").on(table.userId),
]);