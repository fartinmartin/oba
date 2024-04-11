export function getTime(time) {
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return new Date(time).toLocaleTimeString("en-US", {
    timeZone: userTimezone,
    timeStyle: "short",
  });
}

export function getMinutesTil(time) {
  return Math.ceil((time - Date.now()) / (1000 * 60));
}
