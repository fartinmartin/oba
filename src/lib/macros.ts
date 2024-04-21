export function key() {
  // for quick copy/paste, we want to write out API in dev
  return process.env.NODE_ENV === "development"
    ? process.env.API_TOKEN
    : "REPLACE_API_KEY";
}

export function root() {
  return "https://api.pugetsound.onebusaway.org/api/where";
}
