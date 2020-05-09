export function mapObject<TObject extends Record<string, any>, TMappedValue>(
  object: TObject,
  mapper: (value: TObject[keyof TObject]) => TMappedValue
) {
  const newObject: Record<string, any> = {};

  for (const key in object) {
    newObject[key] = mapper(object[key]);
  }

  return newObject as { [TKey in keyof TObject]: TMappedValue };
}
