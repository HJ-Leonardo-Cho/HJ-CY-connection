import { db } from "./db";
import { eq, or, and } from "drizzle-orm";
import {
  users,
  pairings,
  inviteCodes,
  userStatuses,
  type User,
  type Pairing,
  type InviteCode,
  type UserStatus,
} from "@shared/schema";
import crypto from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  
  // Pairing
  createInviteCode(userId: string): Promise<InviteCode>;
  getInviteCode(code: string): Promise<InviteCode | undefined>;
  getInviteCodeByUser(userId: string): Promise<InviteCode | undefined>;
  createPairing(user1Id: string, user2Id: string): Promise<Pairing>;
  getPairing(userId: string): Promise<Pairing | undefined>;
  unpair(userId: string): Promise<void>;
  
  // Status
  getUserStatus(userId: string): Promise<UserStatus | undefined>;
  updateUserStatus(userId: string, currentStatus?: string | null, futureNotice?: string | null): Promise<UserStatus>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async createInviteCode(userId: string): Promise<InviteCode> {
    // Check if one exists
    const existing = await this.getInviteCodeByUser(userId);
    if (existing) return existing;

    const code = crypto.randomBytes(3).toString("hex").toUpperCase(); // 6 chars like A1B2C3
    const [inviteCode] = await db
      .insert(inviteCodes)
      .values({ userId, code })
      .returning();
    return inviteCode;
  }

  async getInviteCode(code: string): Promise<InviteCode | undefined> {
    const [inviteCode] = await db.select().from(inviteCodes).where(eq(inviteCodes.code, code));
    return inviteCode;
  }
  
  async getInviteCodeByUser(userId: string): Promise<InviteCode | undefined> {
    const [inviteCode] = await db.select().from(inviteCodes).where(eq(inviteCodes.userId, userId));
    return inviteCode;
  }

  async createPairing(user1Id: string, user2Id: string): Promise<Pairing> {
    // Clean up any existing codes or pairings for both users
    await db.delete(inviteCodes).where(or(eq(inviteCodes.userId, user1Id), eq(inviteCodes.userId, user2Id)));
    
    // Check if either is already paired and delete
    await db.delete(pairings).where(
      or(
        eq(pairings.user1Id, user1Id), eq(pairings.user2Id, user1Id),
        eq(pairings.user1Id, user2Id), eq(pairings.user2Id, user2Id)
      )
    );

    const [pairing] = await db
      .insert(pairings)
      .values({ user1Id, user2Id })
      .returning();
    return pairing;
  }

  async getPairing(userId: string): Promise<Pairing | undefined> {
    const [pairing] = await db
      .select()
      .from(pairings)
      .where(or(eq(pairings.user1Id, userId), eq(pairings.user2Id, userId)));
    return pairing;
  }
  
  async unpair(userId: string): Promise<void> {
      await db.delete(pairings).where(or(eq(pairings.user1Id, userId), eq(pairings.user2Id, userId)));
  }

  async getUserStatus(userId: string): Promise<UserStatus | undefined> {
    const [status] = await db.select().from(userStatuses).where(eq(userStatuses.userId, userId));
    return status;
  }

  async updateUserStatus(userId: string, currentStatus?: string | null, futureNotice?: string | null): Promise<UserStatus> {
    const existing = await this.getUserStatus(userId);
    
    if (existing) {
      const updates: any = { updatedAt: new Date() };
      if (currentStatus !== undefined) updates.currentStatus = currentStatus;
      if (futureNotice !== undefined) updates.futureNotice = futureNotice;
      
      const [updated] = await db
        .update(userStatuses)
        .set(updates)
        .where(eq(userStatuses.userId, userId))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(userStatuses)
        .values({
          userId,
          currentStatus: currentStatus ?? null,
          futureNotice: futureNotice ?? null
        })
        .returning();
      return created;
    }
  }
}

export const storage = new DatabaseStorage();
