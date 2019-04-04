export function isNumeric(value: string) {
  return !isNaN(parseFloat(value)) && /\-?\d*\.?\d*/.test(value);
}
