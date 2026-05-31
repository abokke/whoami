import { Redis } from "@upstash/redis";
import { checkCors } from "./_lib/cors.js";

const kv = Redis.fromEnv();
const TTL_SECONDS = 30 * 24 * 60 * 60;

const VALID_ID = /^[A-Za-z0-9_-]{1,20}$/;
// UUID v4 形式のみ受け入れる（プライバシー設計: ランダム UUID 以外は弾く）
const VALID_ANON_ID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    if (!checkCors(req, res)) return;
    return res.status(204).end();
  }

  if (!checkCors(req, res)) return;

  if (req.method !== "POST") {
    return res.status(405).json({ error: "method_not_allowed" });
  }

  let body;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  } catch {
    return res.status(400).json({ error: "invalid_json" });
  }

  const { id, score, timeMs, anonId } = body ?? {};

  if (id == null || score == null || timeMs == null || anonId == null) {
    return res.status(400).json({ error: "missing_field" });
  }

  if (!VALID_ID.test(id)) {
    return res.status(400).json({ error: "invalid_field" });
  }
  if (!Number.isInteger(score) || score < 0 || score > 5) {
    return res.status(400).json({ error: "invalid_field" });
  }
  if (!Number.isInteger(timeMs) || timeMs <= 0 || timeMs > 3_600_000) {
    return res.status(400).json({ error: "invalid_field" });
  }
  if (!VALID_ANON_ID.test(anonId)) {
    return res.status(400).json({ error: "invalid_field" });
  }

  // 存在しない quiz ID へのスパム書き込みを防ぐ
  const exists = await kv.exists(`quiz:${id}`);
  if (!exists) {
    return res.status(404).json({ error: "not_found" });
  }

  try {
    const pipeline = kv.pipeline();
    pipeline.incr(`stats:answers:${id}`);
    pipeline.expire(`stats:answers:${id}`, TTL_SECONDS);
    pipeline.hincrby(`stats:score_dist:${id}`, String(score), 1);
    pipeline.expire(`stats:score_dist:${id}`, TTL_SECONDS);
    pipeline.zadd(`stats:times:${id}`, {
      nx: true,
      score: timeMs,
      member: `${anonId}:${Date.now()}`,
    });
    pipeline.expire(`stats:times:${id}`, TTL_SECONDS);
    await pipeline.exec();
  } catch {
    return res.status(500).json({ error: "internal_error" });
  }

  return res.status(200).json({ ok: true });
}
