export const stringUtils = { startsWith, endsWith, splitFirst };

function startsWith(value: string, start: string) {
  for (let i = 0; i < start.length; i++) {
    if (start[i] !== value[i]) {
      return false;
    }
  }
  return true;
}

function endsWith(value: string, end: string) {
  for (let i = 1; i <= end.length; i++) {
    if (end[end.length - i] !== value[value.length - i]) {
      return false;
    }
  }
  return true;
}

function splitFirst(value: string, split: string) {
  const [first, ...rest] = value.split(split);
  return [first, rest.join(split)] as const;
}
