export function sleep(ms) {
  return new Promise((resolve) => Timer.schedule(ms, false, resolve));
}

export async function retry(fn, options) {
  const times = options?.times ?? 3;
  const delay = options?.delay ?? 0;
  // const backoff = options?.backoff ?? ((i) => 10 ** i);
  const backoff = (i) => {
    console.log(`[${i} / ${times}] retrying`);
    return 10 ** i;
  };

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
