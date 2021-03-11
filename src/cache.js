import redis from 'redis';
import util from 'util';
import dotenv from 'dotenv';

dotenv.config();
const {
  REDIS_URL: url,
} = process.env;

let client;
let asyncGet;
let asyncSet;

if (url) {
  client = redis.createClient({ url });
  asyncGet = util.promisify(client.get).bind(client);
  asyncSet = util.promisify(client.set).bind(client);
}

export async function getter(cacheKey) {
  if (!client || !asyncGet) {
    return null;
  }

  let cached;
  try {
    cached = await asyncGet(cacheKey);
  } catch (error) {
    console.error(`errror, ${cacheKey}, ${error.message}`);
    return null;
  }

  if (!cached) {
    return null;
  }

  let result;

  try {
    result = JSON.parse(cached);
  } catch (error) {
    console.error('error in json.parse', error.message);
    return null;
  }

  return result;
}

export async function setter(cacheKey, data, ttl) {
  if (!client || !asyncGet) {
    return false;
  }

  try {
    const serialized = JSON.stringify(data);
    await asyncSet(cacheKey, serialized, 'EX', ttl);
  } catch (e) {
    console.warn('unable to set cache for ', cacheKey);
    return false;
  }
  return true;
}
