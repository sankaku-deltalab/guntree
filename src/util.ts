export const copyMap = <T1, T2>(
  map: Map<T1, T2>,
  applier?: (value: T2) => T2
): Map<T1, T2> => {
  const clone = new Map<T1, T2>();
  for (const [k, rawValue] of map.entries()) {
    const value = applier === undefined ? rawValue : applier(rawValue);
    clone.set(k, value);
  }
  return clone;
};
