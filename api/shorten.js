import { nanoid } from "nanoid";
import { Redis } from "@upstash/redis";
import { checkCors } from "./_lib/cors.js";

const kv = Redis.fromEnv();

const TTL_SECONDS = 30 * 24 * 60 * 60;
const MAX_QUIZ_BYTES = 50 * 1024;

async function createShortId(quizJson) {
  for (let i = 0; i < 5; i++) {
    const id = nanoid(8);
    // nx: true → キーが存在しない場合のみ SET（衝突時は null が返る）
    // nx: true → 衝突時は null が返る
    const result = await kv.set(`quiz:${id}`, quizJson, {
      nx: true,
      ex: TTL_SECONDS,
    });
    if (result !== null) return id;
  }
  throw new Error("id_collision_retry_exhausted");
}

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

  const quiz = body?.quiz;
  if (!quiz || typeof quiz !== "object" || Array.isArray(quiz)) {
    return res.status(400).json({ error: "missing_field" });
  }

  let quizJson;
  try {
    quizJson = JSON.stringify(quiz);
  } catch {
    return res.status(400).json({ error: "invalid_json" });
  }

  if (Buffer.byteLength(quizJson, "utf8") > MAX_QUIZ_BYTES) {
    return res.status(400).json({ error: "input_too_large" });
  }

  let id;
  try {
    id = await createShortId(quizJson);
  } catch (err) {
    if (err.message === "id_collision_retry_exhausted") {
      return res.status(503).json({ error: "id_collision" });
    }
    return res.status(500).json({ error: "internal_error" });
  }

  // fire-and-forget: シェアリンク作成をサーバー側で確実に記録する
  kv.pipeline()
    .incr(`stats:shares:${id}`)
    .expire(`stats:shares:${id}`, TTL_SECONDS)
    .exec()
    .catch(() => {});

  return res.status(200).json({
    id,
    url: `/q/${id}`,
  });
}
