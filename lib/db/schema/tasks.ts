import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, integer, index } from "drizzle-orm/pg-core";
import { rooms } from "./rooms";
import { user } from "./auth";

export const tasks = pgTable("tasks", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status", { enum: ["todo", "in_progress", "done"] })
    .default("todo")
    .notNull(),
  priority: text("priority", { enum: ["low", "medium", "high"] })
    .default("medium")
    .notNull(),
  roomId: text("room_id")
    .notNull()
    .references(() => rooms.id, { onDelete: "cascade" }),
  creatorId: text("creator_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  assigneeId: text("assignee_id")
    .references(() => user.id, { onDelete: "set null" }),
  estimatedMinutes: integer("estimated_minutes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
}, (table) => [
  index("tasks_room_id_idx").on(table.roomId),
  index("tasks_creator_id_idx").on(table.creatorId),
  index("tasks_assignee_id_idx").on(table.assigneeId),
]);

export const taskRelations = relations(tasks, ({ one }) => ({
  room: one(rooms, {
    fields: [tasks.roomId],
    references: [rooms.id],
  }),
  creator: one(user, {
    fields: [tasks.creatorId],
    references: [user.id],
    relationName: "createdTasks",
  }),
  assignee: one(user, {
    fields: [tasks.assigneeId],
    references: [user.id],
    relationName: "assignedTasks",
  }),
}));