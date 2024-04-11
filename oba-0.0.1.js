// user selects an array of stops. for each stop, user also selects which route
// to watch at said stop. when widget is awoken (?) it gets the user's location,
// finds nearest stop in their array, and displays the next bus arrival for the
// selected route at that stop. e.g:

//  🚍 44 (N 46th St & Phinney Ave N)
//  ⏰ 11:09 PM (7 min)
//  ⏰ 11:19 PM (17 min)
//  ⏰ 11:29 PM (27 min)

// https://docs.scriptable.app/
// https://www.soundtransit.org/help-contacts/business-information/open-transit-data-otd

// this file works on comp, the rest will only work via scriptable

import { key } from "./src/lib/macros" with { type: "macro" };

const KEY = key();
const ROOT = "https://api.pugetsound.onebusaway.org/api/where";

main();

const tests = [{ stopID: "1_29225", routeID: "1_100224" }];
const test = tests[0];

async function main() {
  const stop = await getStopDetails(test.stopID);
  const route = await getRouteDetails(test.routeID);

  const arrivals = await getRouteArrivals(test.stopID, test.routeID);

  console.log(`stop: ${stop.name}`);
  console.log(`route: ${route.shortName} (${route.description})`);

  arrivals.slice(0, 3).forEach((a) => {
    const eta = getETA(a);
    const tag = a.predicted ? "" : "*";
    console.log(getTime(eta) + tag, getMinutesTil(eta));
  });
}

// api:details

async function getStopDetails(stopID) {
  const data = await get("stop", stopID);
  return data.entry;
}

async function getRouteDetails(routeID) {
  const data = await get("route", routeID);
  return data.entry;
}

async function getArrivals(stopID) {
  const data = await get("arrivals-and-departures-for-stop", stopID);
  return data.entry.arrivalsAndDepartures;
}

// api:arrivals

async function getRouteArrivals(stopID, routeID) {
  const arrivals = await getArrivals(stopID);
  return arrivals.filter((a) => a.routeId === routeID);
}

function getETA(arrival) {
  return arrival.predicted
    ? arrival.predictedArrivalTime
    : arrival.scheduledArrivalTime;
}

// fetch

async function get(route, id, params) {
  return await retry(async () => _get(route, id, params));
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

async function _get(route, id, params) {
  const url = `${ROOT}/${route}/${id}.json?${getParams(params)}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw Error(`[${response.status}] ${response.statusText}`);
  }

  const { data } = await response.json();
  return data;
}

// time

function getTime(time) {
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return new Date(time).toLocaleTimeString("en-US", {
    timeZone: userTimezone,
    timeStyle: "short",
  });
}

function getMinutesTil(time) {
  return Math.ceil((time - Date.now()) / (1000 * 60));
}

// async

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function retry(fn, options) {
  const times = options?.times ?? 3;
  const delay = options?.delay ?? 0;
  const backoff = options?.backoff ?? ((i) => 10 ** i);

  for (let i = 1; i <= times; i++) {
    try {
      const result = await fn();
      return result;
    } catch (err) {
      if (i === times) throw err;
      if (delay) await sleep(delay);
      if (backoff) await sleep(backoff(i));
    }
  }
}
