import { retry } from "./async";
import { key, root } from "./macros.js" with { type: "macro" };

const KEY = key();
const ROOT = root();

export async function get(route, id, params) {
  try {
    return await retry(async () => _get(route, id, params));
  } catch (error) {
    console.error(error);
  }
}

async function _get(route, id, params) {
  const url = `${ROOT}/${route}/${id}.json?${getParams(params)}`;

  const request = new Request(url);
  const response = await request.loadJSON();

  if (response.code === 429) {
    throw Error(`[${request.response.status}] ${request.response.statusText}`);
  }

  return response.data;
}

function getParams(params) {
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
