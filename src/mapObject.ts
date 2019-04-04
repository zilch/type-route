export function mapObject<T extends object, K>(
  object: T,
  mapper: (value: T[keyof T], key: keyof T) => K
) {
  const keys = Object.keys(object) as (keyof T)[];

  return keys.reduce(
    (result, key) => {
      result[key] = mapper(object[key], key);
      return result;
    },
    {} as { [P in keyof T]: K }
  );
}
