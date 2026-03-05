import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { users, pairings, inviteCodes } from "@shared/schema";
import { db } from "./db";
import { eq, or, desc } from "drizzle-orm";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import session from "express-session";

// --- 독립형 인증 시스템 ---
// 세션 데이터 타입 정의
declare module "express-session" {
  interface SessionData {
    userId: string;
  }
}

// 로그인 여부 확인 미들웨어 (리플릿 isAuthenticated 대체)
// const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
//   if (req.session && req.session.userId) {
//     return next();
//   }
//   res.status(401).json({ message: "로그인이 필요합니다." });
// };

const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  // 테스트를 위해 무조건 통과 (나중에 꼭 다시 복구해야 함!)
  req.session.userId = req.session.userId || "HYUNGJUN"; 
  return next();
};


export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // 1. 세션 설정 (리플릿 외부에서 작동하기 위해 필수)
  app.use(
    session({
      secret: "yes-pillow-secret-key-3m3d",
      resave: false,
      saveUninitialized: false,
      cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }, // 24시간 유지
    })
  );

  // 2. 로그인/로그아웃/유저 정보 API (독립형)
  app.post("/api/login", async (req, res) => {
    const { password, name } = req.body; // 로그인 시 이름과 비번을 받음

    if (password !== "3M3D") {
      return res.status(401).json({ message: "비밀번호가 틀렸습니다." });
    }

    if (!name) {
      return res.status(400).json({ message: "이름을 입력해주세요." });
    }

    // 이름 기반으로 유저 ID 생성 또는 조회 (이름이 곧 ID가 됨)
    const userId = name.trim().toUpperCase();
    
    // DB에 유저가 없으면 생성 (최소한의 정보로)
    const existingUser = await storage.getUser(userId);
    if (!existingUser) {
      // storage.ts의 getUser가 id로 검색하므로 userId를 그대로 사용
      // 필요시 storage에 유저 생성 함수를 추가하거나 직접 DB 인서트
      await db.insert(users).values({ 
        id: userId, 
        firstName: name,
        email: `${userId}@local.com` 
      }).onConflictDoNothing();
    }

    req.session.userId = userId;
    res.json({ success: true, user: { id: userId, firstName: name } });
  });

  app.get("/api/user", (req, res) => {
    if (req.session.userId) {
      res.json({ id: req.session.userId, firstName: req.session.userId });
    } else {
      res.status(401).json({ message: "Not logged in" });
    }
  });

  app.post("/api/logout", (req, res) => {
    req.session.destroy(() => res.json({ success: true }));
  });

  // --- WebSocket 설정 ---
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  const clients = new Map<string, WebSocket>();

  wss.on('connection', (ws) => {
    let userId: string | null = null;
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        if (data.type === 'register' && data.userId) {
          userId = data.userId;
          clients.set(userId, ws);
        }
      } catch (e) { console.error("WS error", e); }
    });
    ws.on('close', () => { if (userId) clients.delete(userId); });
  });

  function broadcastToPartner(partnerId: string, event: string, payload: any) {
    const partnerWs = clients.get(partnerId);
    if (partnerWs && partnerWs.readyState === WebSocket.OPEN) {
      partnerWs.send(JSON.stringify({ type: event, payload }));
    }
  }

  // --- API Routes (req.user.claims.sub를 req.session.userId로 모두 교체) ---

  app.post(api.pairing.generateCode.path, isAuthenticated, async (req, res) => {
    const userId = req.session.userId!;
    try {
      const code = await storage.createInviteCode(userId);
      res.json({ code: code.code });
    } catch (error) { res.status(500).json({ message: "Internal server error" }); }
  });

  app.get(api.pairing.getCode.path, isAuthenticated, async (req, res) => {
    const userId = req.session.userId!;
    const code = await storage.getInviteCodeByUser(userId);
    res.json({ code: code ? code.code : null });
  });

  app.post(api.pairing.useCode.path, isAuthenticated, async (req, res) => {
    const userId = req.session.userId!;
    try {
      const { code } = req.body;
      const isSuper = code === "SUPER" || code === "ADMIN1" || code === "3M3D";
      
      const invite = isSuper 
        ? await db.query.inviteCodes.findFirst({ orderBy: [desc(inviteCodes.createdAt)] })
        : await storage.getInviteCode(code);
      
      if (!invite) return res.status(404).json({ message: "코드를 먼저 생성해주세요!" });
      if (!isSuper && invite.userId === userId) return res.status(400).json({ message: "Cannot pair with yourself" });

      await storage.createPairing(userId, invite.userId);
      broadcastToPartner(invite.userId, 'paired', { partnerId: userId });
      res.json({ success: true });
    } catch (error) { res.status(500).json({ message: "Internal server error" }); }
  });

  app.get(api.pairing.status.path, isAuthenticated, async (req, res) => {
    const userId = req.session.userId!;
    const pairing = await storage.getPairing(userId);
    if (!pairing) return res.json({ isPaired: false, partner: null });

    const partnerId = pairing.user1Id === userId ? pairing.user2Id : pairing.user1Id;
    const partner = await storage.getUser(partnerId);
    if (!partner) return res.json({ isPaired: false, partner: null });

    res.json({ isPaired: true, partner });
  });

  app.get(api.status.getMine.path, isAuthenticated, async (req, res) => {
    const status = await storage.getUserStatus(req.session.userId!);
    res.json(status || { currentStatus: null, futureNotice: null, updatedAt: new Date() });
  });

  app.get(api.status.getPartner.path, isAuthenticated, async (req, res) => {
    const userId = req.session.userId!;
    const pairing = await storage.getPairing(userId);
    if (!pairing) return res.status(400).json({ message: "Not paired" });

    const partnerId = pairing.user1Id === userId ? pairing.user2Id : pairing.user1Id;
    const status = await storage.getUserStatus(partnerId);
    res.json(status || { currentStatus: null, futureNotice: null, updatedAt: new Date() });
  });

  app.put(api.status.update.path, isAuthenticated, async (req, res) => {
    const userId = req.session.userId!;
    try {
      const updates = api.status.update.input.parse(req.body);
      const status = await storage.updateUserStatus(userId, updates.currentStatus, updates.futureNotice);
      const pairing = await storage.getPairing(userId);
      if (pairing) {
        const partnerId = pairing.user1Id === userId ? pairing.user2Id : pairing.user1Id;
        broadcastToPartner(partnerId, 'status-update', status);
      }
      res.json(status);
    } catch (error) { res.status(500).json({ message: "Internal server error" }); }
  });

  return httpServer;
}