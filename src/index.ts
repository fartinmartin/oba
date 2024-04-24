// user selects an array of stops. for each stop, user also selects which route
// to watch at said stop. when widget is refreshed it gets the user's location,
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
  getStopDetails,
  getRouteDetails,
  getRouteArrivals,
  getNearestStop,
} from "./lib/oba";

async function main() {
  try {
    const data = await commute.get();
    if (!data) throw Error(`Could not find commute data`);

    const stopIDs = [
      ...data.commute.trip.map((s) => s.stopID),
      ...data.commute.return.map((s) => s.stopID),
    ];

    const stops = await map(stopIDs, getStopDetails);
    const stop = await getNearestStop(stops);

    const tripLeg = data.commute.trip.find((t) => t.stopID === stop.id);
    const returnLeg = data.commute.return.find((t) => t.stopID === stop.id);

    // TODO: not sure if this logic holds, for example:
    //   - i'm at home, app shows: `trip` stop #1
    //   - i'm on the bus, bus approaches `trip` stop #2 :)
    //   - BUT, app shows: `return` stop #2 :(
    //   - oops, it should show `trip` stop #2, but turns out `return` stop #2 is actually closer

    const leg = tripLeg ?? returnLeg;
    const trip = tripLeg ? data.commute.trip : data.commute.return;

    if (!leg || !trip) throw Error(`Could not find nearest stop in commute`);

    const route = await getRouteDetails(leg.routeID);
    const arrivals = await getRouteArrivals(stop.id, leg.routeID);

    ui.renderCommute({
      lastUpdate: new Date().getTime(),
      commute: data.commute,
      trip,
      stop,
      route,
      arrivals: arrivals.slice(0, 3),
    });
  } catch (error) {
    let message = error instanceof Error ? error.message : String(error);

    if (message.includes("kCLErrorDomain error 1")) {
      // TODO: perhaps we could retry getting location instead of just rendering error?
      message = `Could not get location.\nTap to refresh.`;
    }

    // TODO: error UI should display cached data with `tap to refresh` overlay
    ui.renderError(message);
  }
}

main().catch(console.error);
