import { pgTable, text, timestamp, integer } from "drizzle-orm/pg-core";
import { rooms } from "./rooms";

export const focusSessions = pgTable("focus_sessions", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id").notNull(),
    roomId: text("room_id").references(() => rooms.id, { onDelete: "set null" }),
    startedAt: timestamp("started_at").defaultNow().notNull(),
    endedAt: timestamp("ended_at"),
    durationMinutes: integer("duration_minutes"),
});