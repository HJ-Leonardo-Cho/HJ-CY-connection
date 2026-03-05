import { pgTable, text, serial, integer, boolean, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./models/auth";

export * from "./models/auth";

export const pairings = pgTable("pairings", {
  id: serial("id").primaryKey(),
  user1Id: varchar("user1_id").notNull().references(() => users.id),
  user2Id: varchar("user2_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const inviteCodes = pgTable("invite_codes", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  userId: varchar("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userStatuses = pgTable("user_statuses", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().unique().references(() => users.id),
  currentStatus: text("current_status"),
  futureNotice: text("future_notice"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertPairingSchema = createInsertSchema(pairings).omit({ id: true, createdAt: true });
export const insertInviteCodeSchema = createInsertSchema(inviteCodes).omit({ id: true, createdAt: true });
export const insertUserStatusSchema = createInsertSchema(userStatuses).omit({ id: true, updatedAt: true });

export type Pairing = typeof pairings.$inferSelect;
export type InviteCode = typeof inviteCodes.$inferSelect;
export type UserStatus = typeof userStatuses.$inferSelect;

export type UpdateStatusRequest = {
  currentStatus?: string | null;
  futureNotice?: string | null;
};

export const WS_EVENTS = {
  STATUS_UPDATE: 'status-update',
  PAIRED: 'paired',
} as const;

export interface WsMessage<T = unknown> {
  type: keyof typeof WS_EVENTS;
  payload: T;
}
