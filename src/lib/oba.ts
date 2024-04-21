import { findNearest } from "geolib";
import { cached } from "./get";
import Cache from "./cache";

const stopCache = new Cache("stops");
const routeCache = new Cache("routes");
const arrivalsCache = new Cache("arrivals", 0.5);
const locationCache = new Cache("location", 15);

// oba:details

export async function getStopDetails(stopID: string) {
  return await cached<Stop>({
    cache: stopCache,
    route: "stop",
    id: stopID,
    transform: (data) => data.entry,
  });
}

export async function getRouteDetails(routeID: string) {
  return await cached<Route>({
    cache: routeCache,
    route: "route",
    id: routeID,
    transform: (data) => data.entry,
  });
}

//

export async function getArrivals(stopID: string) {
  return await cached<Arrival[]>({
    cache: arrivalsCache,
    route: "arrivals-and-departures-for-stop",
    id: stopID,
    transform: (data) => data.entry.arrivalsAndDepartures,
  });
}

// oba:arrivals

export async function getRouteArrivals(stopID: string, routeID: string) {
  const arrivals = await getArrivals(stopID);
  return arrivals.filter((a) => a.routeId === routeID);
}

// oba:utils

export function getETA(arrival: Arrival) {
  return arrival.predicted
    ? arrival.predictedArrivalTime
    : arrival.scheduledArrivalTime;
}

export async function getNearestStop(stops: Stop[]) {
  let location = await locationCache.read("data");

  if (!location) {
    location = await Location.current();
    locationCache.write("data", location);
  }

  return findNearest(location, stops) as Stop;
}

//

export type Stop = {
  id: string;
  lat: number;
  lon: number;
  direction: string;
  name: string;
  code: string;
  locationType: number;
  wheelchairBoarding: string;
  routeIds: string[];
};

export type Route = {
  id: string;
  shortName: string;
  longName: string;
  description: string;
  type: number;
  url: string;
  color: string;
  textColor: string;
  agencyId: string;
};

export type Arrival = {
  routeId: string;
  tripId: string;
  serviceDate: number;
  stopId: string;
  stopSequence: number;
  blockTripSequence: number;
  routeShortName: string;
  routeLongName: string;
  tripHeadsign: string;
  arrivalEnabled: boolean;
  departureEnabled: boolean;
  scheduledArrivalTime: number;
  scheduledDepartureTime: number;
  frequency: any; // Type definition needed
  predicted: boolean;
  predictedArrivalTime: number;
  predictedDepartureTime: number;
  distanceFromStop: number;
  numberOfStopsAway: number;
  tripStatus: any; // Type definition needed
};
