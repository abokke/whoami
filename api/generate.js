import Groq from "groq-sdk";
import { Redis } from "@upstash/redis";
import { checkCors } from "./_lib/cors.js";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const kv = Redis.fromEnv();

const MAX_PROFILE_LENGTH = 2000;

const SYSTEM_PROMPT = `You are an editor of a personality quiz for friends.
Read the person memo below and output a quiz JSON — nothing else.

STRICT REQUIREMENTS (violating any of these will break the app):
- EXACTLY 5 questions — not 3, not 4, not 6. Count before you respond.
- EXACTLY 4 choices per question — not 3, not 5. Count each question.
- EVERY string field must be bilingual: { "en": "...", "ja": "..." }
- title must also be bilingual: { "en": "...", "ja": "..." }
- answerIndex is a 0-based integer (0, 1, 2, or 3)
- Output ONLY the raw JSON object. No markdown, no code block, no explanation.
- Do NOT truncate. Output all 5 questions in full.

JSON schema (follow exactly):
{
  "title": { "en": "...", "ja": "..." },
  "questions": [
    {
      "question": { "en": "...", "ja": "..." },
      "choices": [
        { "en": "...", "ja": "..." },
        { "en": "...", "ja": "..." },
        { "en": "...", "ja": "..." },
        { "en": "...", "ja": "..." }
      ],
      "answerIndex": 0,
      "explanation": { "en": "...", "ja": "..." }
    }
  ]
}`;

async function checkRateLimit(ip) {
  const today = new Date().toISOString().slice(0, 10);
  const key = `ratelimit:generate:${ip}:${today}`;
  const count = await kv.incr(key);
  if (count === 1) {
    await kv.expire(key, 86400);
  }
  return count <= 10;
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

  const profile = body?.profile;
  if (!profile || typeof profile !== "string" || profile.trim().length === 0) {
    return res.status(400).json({ error: "missing_field" });
  }
  if (profile.length > MAX_PROFILE_LENGTH) {
    return res.status(400).json({ error: "input_too_large" });
  }

  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0].trim() ??
    req.socket?.remoteAddress ??
    "unknown";
  const allowed = await checkRateLimit(ip);
  if (!allowed) {
    return res.status(429).json({ error: "rate_limit_exceeded" });
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 25000);
  let completion;
  try {
    completion = await groq.chat.completions.create(
      {
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: profile.trim() },
        ],
        temperature: 0.8,
        max_tokens: 2048,
        response_format: { type: "json_object" },
      },
      { signal: controller.signal }
    );
  } catch (err) {
    if (err.name === "AbortError") {
      return res.status(504).json({ error: "upstream_timeout" });
    }
    return res.status(502).json({ error: "upstream_error" });
  } finally {
    clearTimeout(timeoutId);
  }

  let quiz;
  try {
    const raw = completion.choices[0].message.content;
    // response_format: json_object を指定しても Groq が稀に markdown で包む
    const stripped = raw.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
    quiz = JSON.parse(stripped);
  } catch {
    return res.status(502).json({ error: "upstream_error" });
  }

  return res.status(200).json({ quiz });
}
