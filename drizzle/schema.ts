import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * 开奖号码表：存储每期的开奖数据
 */
export const lotteryDraws = mysqlTable("lottery_draws", {
  id: int("id").autoincrement().primaryKey(),
  /** 开奖号码（后三位，如 "123"） */
  number: varchar("number", { length: 3 }).notNull(),
  /** 原始四位数 */
  originalNumber: varchar("original_number", { length: 4 }),
  /** 统计数值 */
  statisticalNumber: int("statistical_number"),
  /** 开奖时间 */
  gameTime: timestamp("game_time").notNull(),
  /** 创建时间 */
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type LotteryDraw = typeof lotteryDraws.$inferSelect;
export type InsertLotteryDraw = typeof lotteryDraws.$inferInsert;

/**
 * 号码评分表：存储每个号码的四维评分
 */
export const lotteryScores = mysqlTable("lottery_scores", {
  id: int("id").autoincrement().primaryKey(),
  /** 号码（三位数） */
  number: varchar("number", { length: 3 }).notNull().unique(),
  /** 和值 */
  sum: int("sum").notNull(),
  /** 跨度 */
  span: int("span").notNull(),
  /** 和值评分 */
  sumScore: varchar("sum_score", { length: 10 }).notNull(),
  /** 跨度评分 */
  spanScore: varchar("span_score", { length: 10 }).notNull(),
  /** 冷热码评分 */
  hotColdScore: varchar("hot_cold_score", { length: 10 }).notNull(),
  /** 理论命中率评分 */
  hitScore: varchar("hit_score", { length: 10 }).notNull(),
  /** 综合评分 */
  totalScore: varchar("total_score", { length: 10 }).notNull(),
  /** 是否包含 Key 码 */
  containsKeyCode: int("contains_key_code").default(0),
  /** 是否为边缘值 */
  isEdgeValue: int("is_edge_value").default(0),
  /** 更新时间 */
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type LotteryScore = typeof lotteryScores.$inferSelect;
export type InsertLotteryScore = typeof lotteryScores.$inferInsert;

/**
 * L6 命中统计表：记录每期开奖号码是否命中 L6 层级
 */
export const l6Statistics = mysqlTable("l6_statistics", {
  id: int("id").autoincrement().primaryKey(),
  /** 开奖号码 */
  drawNumber: varchar("draw_number", { length: 3 }).notNull(),
  /** 是否命中 L6 */
  isHit: int("is_hit").notNull(),
  /** 开奖时间 */
  drawTime: timestamp("draw_time").notNull(),
  /** 创建时间 */
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type L6Statistic = typeof l6Statistics.$inferSelect;
export type InsertL6Statistic = typeof l6Statistics.$inferInsert;

/**
 * 层级结果缓存表：存储各层筛选结果
 */
export const layerResults = mysqlTable("layer_results", {
  id: int("id").autoincrement().primaryKey(),
  /** 层级标识（L9, L8, ..., L1） */
  layerId: varchar("layer_id", { length: 2 }).notNull(),
  /** 该层的所有号码（JSON 格式） */
  numbers: text("numbers").notNull(),
  /** 该层的号码数量 */
  count: int("count").notNull(),
  /** 更新时间 */
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type LayerResult = typeof layerResults.$inferSelect;
export type InsertLayerResult = typeof layerResults.$inferInsert;