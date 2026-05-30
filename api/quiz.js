import { Redis } from "@upstash/redis";
import { checkCors } from "./_lib/cors.js";

const kv = Redis.fromEnv();

const VALID_ID = /^[A-Za-z0-9_-]{1,20}$/;

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    if (!checkCors(req, res)) return;
    return res.status(204).end();
  }

  if (!checkCors(req, res)) return;

  if (req.method !== "GET") {
    return res.status(405).json({ error: "method_not_allowed" });
  }

  const { id } = req.query;
  if (!id || !VALID_ID.test(id)) {
    return res.status(400).json({ error: "missing_field" });
  }

  let quizRaw;
  try {
    quizRaw = await kv.get(`quiz:${id}`);
  } catch {
    return res.status(500).json({ error: "internal_error" });
  }

  if (quizRaw === null) {
    return res.status(404).json({ error: "not_found" });
  }

  // @upstash/redis が自動 JSON パースするため型が不定
  let quiz;
  try {
    quiz = typeof quizRaw === "string" ? JSON.parse(quizRaw) : quizRaw;
  } catch {
    return res.status(500).json({ error: "internal_error" });
  }

  return res.status(200).json({ quiz });
}
