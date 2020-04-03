import { TypeRouteError } from "./TypeRouteError";

export function assert(
  context: string,
  assertions: ((context: string) => void)[]
) {
  assertions.forEach(assert => assert(context));
}

assert.numArgs = (args: any[], min: number, max = min) => (context: string) => {
  if (args.length < min || args.length > max) {
    throw TypeRouteError.Expected_number_of_arguments_does_match_actual_number.create(
      {
        context,
        args,
        min,
        max
      }
    );
  }
};

assert.collectionOfType = (
  expectedType: string | string[],
  valueName: string,
  value: any
) => (context: string) => {
  if (typeOf(value) === "object") {
    const valuePropertyNames = Object.keys(value);

    for (const propertyName of valuePropertyNames) {
      assert.type(
        expectedType,
        `${valueName}.${propertyName}`,
        value[propertyName]
      )(context);
    }

    return;
  }

  throw TypeRouteError.Expected_type_does_not_match_actual_type.create({
    context,
    actualType: typeOf(value),
    expectedType: `Record<string, ${
      Array.isArray(expectedType) ? expectedType.join(" | ") : expectedType
    }>`,
    value,
    valueName
  });
};

assert.arrayOfType = (
  expectedType: string | string[],
  valueName: string,
  value: any
) => (context: string) => {
  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index++) {
      assert.type(
        expectedType,
        `${valueName}[${index}]`,
        value[index]
      )(context);
    }

    return;
  }

  throw TypeRouteError.Expected_type_does_not_match_actual_type.create({
    context,
    actualType: typeOf(value),
    expectedType: `Array<${
      Array.isArray(expectedType) ? expectedType.join(" | ") : expectedType
    }>`,
    value,
    valueName
  });
};

assert.type = (
  expectedType: string | string[],
  valueName: string,
  value: any
) => (context: string) => {
  const expectedTypeList =
    typeof expectedType === "string" ? [expectedType] : expectedType;

  for (const expectedType of expectedTypeList) {
    const expectsProperType = expectedType[0].toUpperCase() === expectedType[0];

    if (
      (expectsProperType &&
        typeOf(value) === "object" &&
        typeOf(value._internal) === "object" &&
        value._internal.type === expectedType) ||
      (!expectsProperType && typeOf(value) === expectedType)
    ) {
      return;
    }
  }

  throw TypeRouteError.Expected_type_does_not_match_actual_type.create({
    context,
    actualType: typeOf(value),
    expectedType,
    value,
    valueName
  });
};

export function typeOf(value: any) {
  if (value === null) {
    return "null";
  }

  if (Array.isArray(value)) {
    return "array";
  }

  return typeof value;
}
