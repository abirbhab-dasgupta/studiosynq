import { pgTable, text, timestamp, boolean, index } from "drizzle-orm/pg-core";
import { rooms } from "./rooms";

export const roomInvites = pgTable("room_invites", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    roomId: text("room_id").notNull().references(() => rooms.id, { onDelete: "cascade" }),
    token: text("token").notNull().unique(),
    createdBy: text("created_by").notNull(),
    mode: text("mode", { enum: ["request", "auto"] }).default("request").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    expiresAt: timestamp("expires_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
    index("room_invites_token_idx").on(table.token),
    index("room_invites_room_id_idx").on(table.roomId),
]);