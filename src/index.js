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

import * as store from "./lib/store.js";

import { getStopDetails, getRouteDetails, getRouteArrivals } from "./lib/oba";
import { getETA } from "./lib/oba";
import { getTime, getMinutesTil } from "./lib/time";

async function main() {
  // TODO: build UI

  const options = await store.create("oba-options", {
    commutes: [
      {
        name: "To Work",
        stops: ["1_29225", "1_10912"],
        routes: ["1_100224", /* 44 */ "1_100162" /* 271 */],
        start: 4,
        end: 12,
      },
      {
        name: "From Work",
        stops: ["1_67655", "1_29405"],
        routes: ["1_100162", "1_100224"],
        start: 12,
        end: 18,
      },
    ],
  });

  const commutes = options.get("commutes");
  const commute = commutes[0];

  const stopID = commute.stops[0];
  const routeID = commute.routes[0];

  const stop = await getStopDetails(stopID);
  const route = await getRouteDetails(routeID);

  const arrivals = await getRouteArrivals(stopID, routeID);

  console.log(`stop: ${stop.name}`);
  console.log(`route: ${route.shortName} (${route.description})`);

  arrivals.slice(0, 3).forEach((a) => {
    const eta = getETA(a);
    const tag = a.predicted ? "" : "*";
    console.log(getTime(eta) + tag, getMinutesTil(eta));
  });
}

main().catch(console.error);
