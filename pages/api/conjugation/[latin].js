const cache = new Map();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export default async function handler(req, res) {
  const { latin } = req.query;

  const cached = cache.get(latin);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    res.setHeader("Cache-Control", "public, max-age=86400, stale-while-revalidate=3600");
    return res.status(200).json(cached.data);
  }

  try {
    const response = await fetch(
      `${process.env.CONJUGATION_API_URL}/verb/${encodeURIComponent(latin)}`
    );

    if (!response.ok) {
      return res.status(response.status).end();
    }

    const data = await response.json();
    cache.set(latin, { data, timestamp: Date.now() });

    res.setHeader("Cache-Control", "public, max-age=86400, stale-while-revalidate=3600");
    return res.status(200).json(data);
  } catch {
    return res.status(502).end();
  }
}
