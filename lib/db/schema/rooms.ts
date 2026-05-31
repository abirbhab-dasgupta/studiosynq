import { pgTable, text, timestamp, boolean, index } from "drizzle-orm/pg-core";

export const rooms = pgTable("rooms", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull(),
    createdBy: text("created_by").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
    index("rooms_created_by_idx").on(table.createdBy),
]);
export const roomMembers = pgTable("room_members", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    roomId: text("room_id").notNull().references(() => rooms.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(),
    joinedAt: timestamp("joined_at").defaultNow().notNull(),
}, (table) => [
    index("room_members_user_id_idx").on(table.userId),
    index("room_members_room_id_idx").on(table.roomId),
]); 