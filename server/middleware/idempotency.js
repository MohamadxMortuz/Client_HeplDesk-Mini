import { v4 as uuidv4 } from 'uuid';
const store = new Map();

export const idempotency = (req, res, next) => {
  if (req.method !== 'POST') return next();
  const key = req.get('Idempotency-Key');
  if (!key) return next();
  if (store.has(key)) {
    const cached = store.get(key);
    return res.status(200).json(cached);
  }
  const origJson = res.json.bind(res);
  res.json = (body) => {
    store.set(key, body);
    return origJson(body);
  };
  next();
};
