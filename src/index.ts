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
// https://bun.sh/docs

import * as commute from "./lib/commute";
import * as ui from "./lib/ui";
import { map } from "./lib/async";
import {
  getNearestStop,
  getRouteArrivals,
  getRouteDetails,
  getStopDetails,
} from "./lib/oba";

async function main() {
  try {
    const data = await commute.get();
    if (!data) throw Error(`Could not find commute data`);

    const stopIDs = data.commute.trip.map((s) => s.stopID);
    const stops = await map(stopIDs, getStopDetails);
    const stop = await getNearestStop(stops);

    const tripStop = data.commute.trip.find((t) => t.stopID === stop.id);
    if (!tripStop) throw Error(`Could not find nearest stop in commute`);

    const route = await getRouteDetails(tripStop.routeID);
    const arrivals = await getRouteArrivals(stop.id, tripStop.routeID);

    ui.renderCommute({
      commute: data.commute,
      stop,
      route,
      arrivals: arrivals.slice(0, 3),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    ui.renderError(message);
  }
}

main().catch(console.error);
