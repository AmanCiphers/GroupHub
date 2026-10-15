const WINDOW_MS = 60 * 1000;
const MAX_PER_WINDOW = 10;
const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_PER_DAY = 100;

const buckets = new Map();

const cleanup = () => {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    bucket.window = bucket.window.filter((t) => now - t < WINDOW_MS);
    bucket.day = bucket.day.filter((t) => now - t < DAY_MS);
    if (bucket.window.length === 0 && bucket.day.length === 0) {
      buckets.delete(key);
    }
  }
};

export const rateLimit = (req, res, next) => {
  const key = req.user?.userId || req.ip;
  const now = Date.now();

  const bucket = buckets.get(key) || { window: [], day: [] };
  bucket.window = bucket.window.filter((t) => now - t < WINDOW_MS);
  bucket.day = bucket.day.filter((t) => now - t < DAY_MS);

  if (bucket.day.length >= MAX_PER_DAY) {
    return res.status(429).json({ message: "Daily AI limit reached. Try again tomorrow." });
  }

  if (bucket.window.length >= MAX_PER_WINDOW) {
    return res.status(429).json({ message: "Too many AI requests. Please wait a minute." });
  }

  bucket.window.push(now);
  bucket.day.push(now);
  buckets.set(key, bucket);

  cleanup();
  return next();
};