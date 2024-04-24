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

// radash

export const isEqual = <TType>(x: TType, y: TType): boolean => {
  if (Object.is(x, y)) return true;
  if (x instanceof Date && y instanceof Date) {
    return x.getTime() === y.getTime();
  }
  if (x instanceof RegExp && y instanceof RegExp) {
    return x.toString() === y.toString();
  }
  if (
    typeof x !== "object" ||
    x === null ||
    typeof y !== "object" ||
    y === null
  ) {
    return false;
  }
  const keysX = Reflect.ownKeys(x as unknown as object) as (keyof typeof x)[];
  const keysY = Reflect.ownKeys(y as unknown as object);
  if (keysX.length !== keysY.length) return false;
  for (let i = 0; i < keysX.length; i++) {
    if (!Reflect.has(y as unknown as object, keysX[i])) return false;
    if (!isEqual(x[keysX[i]], y[keysX[i]])) return false;
  }
  return true;
};
