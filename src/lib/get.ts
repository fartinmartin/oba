import { retry } from "./async";
import type Cache from "./cache";
import { key, root } from "./macros" with { type: "macro" };

type CachedOptions<T> = {
  cache: Cache;
  route: string;
  id: string;
  transform?: (data: any) => T;
  params?: any;
};

export async function cached<T>({
  cache,
  route,
  id,
  transform,
  params,
}: CachedOptions<T>) {
  const value = await cache.read(id);
  if (value) return value as T;

  const data = await get(route, id, params);
  const result = transform ? transform(data) : (data as T);
  cache.write(id, result);

  return result;
}

export async function get(route: string, id: string, params?: any) {
  try {
    return await retry(async () => http(route, id, params));
  } catch (error) {
    console.error(error);
  }
}

//

const KEY = key() as string;
const ROOT = root() as string;

async function http(route: string, id: string, params?: any) {
  const url = `${ROOT}/${route}/${id}.json?${getParams(params)}`;

  const request = new Request(url);
  const response = await request.loadJSON();

  if (response.code === 429) {
    // @ts-ignore
    throw Error(`[429] ${request.text}`);
  }

  return response.data;
}

function getParams(params?: any) {
  if (params) {
    const _ = new URLSearchParams();
    _.append("key", KEY);
    for (const key in params) _.append(key, params[key]);
    params = _.toString();
  } else {
    params = `key=${KEY}`;
  }

  return params;
}
