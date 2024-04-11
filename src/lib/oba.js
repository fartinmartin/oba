import { get } from "./get";

// oba:details

export async function getStopDetails(stopID) {
  const data = await get("stop", stopID);
  return data.entry;
}

export async function getRouteDetails(routeID) {
  const data = await get("route", routeID);
  return data.entry;
}

export async function getArrivals(stopID) {
  const data = await get("arrivals-and-departures-for-stop", stopID);
  return data.entry.arrivalsAndDepartures;
}

// oba:arrivals

export async function getRouteArrivals(stopID, routeID) {
  const arrivals = await getArrivals(stopID);
  return arrivals.filter((a) => a.routeId === routeID);
}

// oba:utils

export function getETA(arrival) {
  return arrival.predicted
    ? arrival.predictedArrivalTime
    : arrival.scheduledArrivalTime;
}

export function getNearestStop(stopIDs, location) {}
