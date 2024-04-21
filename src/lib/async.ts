export function sleep(ms: number) {
  return new Promise((resolve) => Timer.schedule(ms, false, () => resolve(ms)));
}

export const map = async <T, K>(
  array: readonly T[],
  asyncMapFunc: (item: T, index: number) => Promise<K>,
): Promise<K[]> => {
  if (!array) return [];
  let result = [];
  let index = 0;
  for (const value of array) {
    const newValue = await asyncMapFunc(value, index++);
    result.push(newValue);
  }
  return result;
};

export async function retry<T>(
  fn: () => Promise<T>,
  options?: { times?: number; delay?: number },
) {
  const times = options?.times ?? 3;
  const delay = options?.delay ?? 0;
  // const backoff = options?.backoff ?? ((i) => 10 ** i);
  const backoff = (i: number) => {
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
