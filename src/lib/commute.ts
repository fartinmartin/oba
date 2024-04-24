export * as commute from "./commute";
import * as io from "./io";

export type Commute = {
  name: string;
  trip: Leg[];
  return: Leg[];
};

type Leg = {
  routeID: string;
  stopID: string;
};

export async function get() {
  const path = io.appPath("options.json");
  return io.read<{ commute: Commute }>(path);
}
