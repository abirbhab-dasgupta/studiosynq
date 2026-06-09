import { pgTable, text, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { rooms } from "./rooms";

export const focusSessions = pgTable("focus_sessions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull(),
  roomId: text("room_id").references(() => rooms.id, { onDelete: "set null" }),
  type: text("type", { enum: ["focus", "short_break", "long_break"] })
    .notNull()
    .default("focus"),
  durationMinutes: integer("duration_minutes"),
  completed: boolean("completed").notNull().default(false),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  endedAt: timestamp("ended_at"),
});