export function splitFirst(value: string, split: string) {
  const [first, ...rest] = value.split(split);
  return [first, rest.join(split)] as const;
}
