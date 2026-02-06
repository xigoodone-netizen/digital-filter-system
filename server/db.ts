import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, lotteryDraws, lotteryScores, l6Statistics, layerResults, InsertLotteryDraw, InsertLotteryScore, InsertL6Statistic } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ==================== Lottery Data Queries ====================

export async function getLatestDraws(limit: number = 10) {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select()
    .from(lotteryDraws)
    .orderBy((t) => desc(t.gameTime))
    .limit(limit);
}

export async function saveLotteryDraw(draw: InsertLotteryDraw) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.insert(lotteryDraws).values(draw);
  return result;
}

export async function saveLotteryScores(scores: InsertLotteryScore[]) {
  const db = await getDb();
  if (!db) return null;
  
  // Use onDuplicateKeyUpdate to handle existing numbers
  for (const score of scores) {
    await db
      .insert(lotteryScores)
      .values(score)
      .onDuplicateKeyUpdate({
        set: {
          sum: score.sum,
          span: score.span,
          sumScore: score.sumScore,
          spanScore: score.spanScore,
          hotColdScore: score.hotColdScore,
          hitScore: score.hitScore,
          totalScore: score.totalScore,
          containsKeyCode: score.containsKeyCode,
          isEdgeValue: score.isEdgeValue,
        },
      });
  }
}

export async function saveL6Statistic(stat: InsertL6Statistic) {
  const db = await getDb();
  if (!db) return null;
  
  return db.insert(l6Statistics).values(stat);
}

export async function getL6Statistics(limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select()
    .from(l6Statistics)
    .orderBy((t) => desc(t.createdAt))
    .limit(limit);
}

export async function getL6HitRate() {
  const db = await getDb();
  if (!db) return { total: 0, hits: 0, rate: 0 };
  
  const stats = await db.select().from(l6Statistics);
  const total = stats.length;
  const hits = stats.filter((s) => s.isHit === 1).length;
  const rate = total > 0 ? ((hits / total) * 100).toFixed(2) : "0.00";
  
  return { total, hits, rate: parseFloat(rate as string) };
}

export async function saveLayerResults(layerId: string, numbers: any[]) {
  const db = await getDb();
  if (!db) return null;
  
  // Delete existing results for this layer
  await db.delete(layerResults).where(eq(layerResults.layerId, layerId));
  
  // Insert new results
  return db.insert(layerResults).values({
    layerId,
    numbers: JSON.stringify(numbers),
    count: numbers.length,
  });
}

export async function getLayerResults(layerId: string) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db
    .select()
    .from(layerResults)
    .where(eq(layerResults.layerId, layerId))
    .limit(1);
  
  if (result.length > 0) {
    try {
      return JSON.parse(result[0].numbers);
    } catch {
      return [];
    }
  }
  return [];
}
