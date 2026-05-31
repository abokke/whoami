export const ALLOWED_ORIGINS = new Set([
  "https://whoknowsme.app",
  "https://quizgen-chi.vercel.app",
  "http://localhost:3000",
  "http://localhost:3333",
]);

export function checkCors(req, res) {
  const origin = req.headers["origin"] ?? "";
  const secFetchSite = req.headers["sec-fetch-site"] ?? "";

  const originAllowed = !origin || ALLOWED_ORIGINS.has(origin);
  const fetchSiteAllowed =
    !secFetchSite ||
    ["same-origin", "same-site", "none"].includes(secFetchSite);

  if (!originAllowed || !fetchSiteAllowed) {
    res.status(403).json({ error: "forbidden" });
    return false;
  }

  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  return true;
}
