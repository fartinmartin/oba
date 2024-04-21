export function getTime(time: number) {
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return new Date(time).toLocaleTimeString("en-US", {
    timeZone: userTimezone,
    timeStyle: "short",
  });
}

export function getMinutesTil(time: number) {
  return Math.ceil((time - Date.now()) / (1000 * 60));
}
