import { relations } from "drizzle-orm/relations";
import { user, account, session, rooms, roomMembers } from "./schema";

export const accountRelations = relations(account, ({one}) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	}),
}));

export const userRelations = relations(user, ({many}) => ({
	accounts: many(account),
	sessions: many(session),
}));

export const sessionRelations = relations(session, ({one}) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	}),
}));

export const roomMembersRelations = relations(roomMembers, ({one}) => ({
	room: one(rooms, {
		fields: [roomMembers.roomId],
		references: [rooms.id]
	}),
}));

export const roomsRelations = relations(rooms, ({many}) => ({
	roomMembers: many(roomMembers),
}));