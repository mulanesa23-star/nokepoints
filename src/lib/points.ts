import { prisma } from "./prisma";

const DEFAULTS = {
  POINTS_PER_TICK: 100,
  SUBSCRIBER_MULTIPLIER: 2,
  CHAT_BONUS_PER_MSG: 10,
  DAILY_CHAT_BONUS_LIMIT: 50,
  TICK_INTERVAL_MS: 2 * 60 * 1000,
};

export type PointsConfig = typeof DEFAULTS;

export async function getPointsConfig(): Promise<PointsConfig> {
  try {
    const keys = Object.keys(DEFAULTS);
    const rows = await prisma.config.findMany({
      where: { id: { in: keys } },
    });
    const stored: Record<string, string> = {};
    for (const row of rows) stored[row.id] = row.value;
    const config = { ...DEFAULTS };
    for (const key of keys) {
      if (stored[key] !== undefined) {
        const val = parseInt(stored[key], 10);
        if (!isNaN(val)) (config as any)[key] = val;
      }
    }
    return config;
  } catch {
    return DEFAULTS;
  }
}

export async function calcWatchtimePoints(isSubscriber: boolean): Promise<number> {
  const cfg = await getPointsConfig();
  const base = cfg.POINTS_PER_TICK;
  return isSubscriber ? base * cfg.SUBSCRIBER_MULTIPLIER : base;
}

export function getTodayStart(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}
