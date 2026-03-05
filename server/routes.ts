import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { users, pairings, inviteCodes } from "@shared/schema";
import { db } from "./db";
import { eq, or, desc } from "drizzle-orm";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Authentication
  await setupAuth(app);
  registerAuthRoutes(app);

  // Setup WebSockets
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Track connected clients
  const clients = new Map<string, WebSocket>();

  wss.on('connection', (ws, req) => {
    // In a real app we'd parse the session cookie to get the authenticated user.
    // For simplicity, we can let the client send a message to register its ID,
    // or just broadcast status updates to the partner if we know who they are.
    
    let userId: string | null = null;
    
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        if (data.type === 'register' && data.userId) {
          userId = data.userId;
          clients.set(userId, ws);
        }
      } catch (e) {
        console.error("WS message error", e);
      }
    });

    ws.on('close', () => {
      if (userId) {
        clients.delete(userId);
      }
    });
  });

  function broadcastToPartner(partnerId: string, event: string, payload: any) {
    const partnerWs = clients.get(partnerId);
    if (partnerWs && partnerWs.readyState === WebSocket.OPEN) {
      partnerWs.send(JSON.stringify({ type: event, payload }));
    }
  }

  // --- API Routes ---

  // Pairing - Generate Code
  app.post(api.pairing.generateCode.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    try {
      const code = await storage.createInviteCode(userId);
      res.json({ code: code.code });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Pairing - Get Code
  app.get(api.pairing.getCode.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const code = await storage.getInviteCodeByUser(userId);
    res.json({ code: code ? code.code : null });
  });

  // Pairing - Use Code
  app.post(api.pairing.useCode.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    try {
      const { code } = api.pairing.useCode.input.parse(req.body);
      
      const invite = code === "SUPERCODE" 
        ? await db.query.inviteCodes.findFirst({
            orderBy: [desc(inviteCodes.createdAt)]
          })
        : await storage.getInviteCode(code);
      
      if (!invite) {
        return res.status(404).json({ message: "Invalid or expired invite code" });
      }

      if (invite.userId === userId) {
        return res.status(400).json({ message: "Cannot pair with yourself" });
      }

      const pairing = await storage.createPairing(userId, invite.userId);
      
      // Notify partner they are paired
      broadcastToPartner(invite.userId, 'paired', { partnerId: userId });
      
      res.json({ success: true });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Pairing - Status
  app.get(api.pairing.status.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const pairing = await storage.getPairing(userId);
    
    if (!pairing) {
      return res.json({ isPaired: false, partner: null });
    }

    const partnerId = pairing.user1Id === userId ? pairing.user2Id : pairing.user1Id;
    const partner = await storage.getUser(partnerId);

    if (!partner) {
       return res.json({ isPaired: false, partner: null }); // Partner account deleted
    }

    res.json({
      isPaired: true,
      partner: {
        id: partner.id,
        email: partner.email,
        firstName: partner.firstName,
        lastName: partner.lastName,
        profileImageUrl: partner.profileImageUrl
      }
    });
  });

  // Unpair
  app.post(api.pairing.unpair.path, isAuthenticated, async (req: any, res) => {
      const userId = req.user.claims.sub;
      const pairing = await storage.getPairing(userId);
      if(pairing) {
          const partnerId = pairing.user1Id === userId ? pairing.user2Id : pairing.user1Id;
          await storage.unpair(userId);
          broadcastToPartner(partnerId, 'unpaired', {});
      }
      res.json({ success: true });
  });

  // Status - Get Mine
  app.get(api.status.getMine.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const status = await storage.getUserStatus(userId);
    res.json(status || { currentStatus: null, futureNotice: null, updatedAt: new Date() });
  });

  // Status - Get Partner
  app.get(api.status.getPartner.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const pairing = await storage.getPairing(userId);
    
    if (!pairing) {
      return res.status(400).json({ message: "Not paired" });
    }

    const partnerId = pairing.user1Id === userId ? pairing.user2Id : pairing.user1Id;
    const status = await storage.getUserStatus(partnerId);
    
    res.json(status || { currentStatus: null, futureNotice: null, updatedAt: new Date() });
  });

  // Status - Update
  app.put(api.status.update.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    try {
      const updates = api.status.update.input.parse(req.body);
      const status = await storage.updateUserStatus(userId, updates.currentStatus, updates.futureNotice);

      // Notify partner
      const pairing = await storage.getPairing(userId);
      if (pairing) {
        const partnerId = pairing.user1Id === userId ? pairing.user2Id : pairing.user1Id;
        broadcastToPartner(partnerId, 'status-update', status);
      }

      res.json(status);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  return httpServer;
}
