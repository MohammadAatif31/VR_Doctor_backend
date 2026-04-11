//cache for storing responses to avoid redundant processing

// In-memory cache (fastest)
const cacheStore = new Map();

// get cache
export const getCache = (key) => {
  return cacheStore.get(key.toLowerCase());
};

// set cache
export const setCache = (key, value) => {
  cacheStore.set(key.toLowerCase(), value);
};

// optional: clear cache
export const clearCache = () => {
  cacheStore.clear();
};