type ValueSerializer<Value> = {
  urlEncode?: boolean;
  parse(raw: string): Value | typeof noMatch;
  toString(value: Value): string;
};

type BasePathParameterDefinition<Value> = {
  type: "path";
  valueSerializer: ValueSerializer<Value>;
  trailing: boolean;
};

type BaseQueryParameterDefinition<Value> = {
  type: "query";
  valueSerializer: ValueSerializer<Value>;
};

type BaseStateParameterDefinition<Value> = {
  type: "state";
  valueSerializer: ValueSerializer<Value>;
};

type RequiredParameterDefinitionPart = {
  optional: false;
};

type OptionalParameterDefinitionPart = {
  optional: true;
};

type NamedParameterDefinitionPart = {
  name: string;
};

type RequiredPathParameterDefinition<Value> = BasePathParameterDefinition<
  Value
> &
  RequiredParameterDefinitionPart;
type OptionalPathParameterDefinition<Value> = BasePathParameterDefinition<
  Value
> &
  OptionalParameterDefinitionPart;
export type PathParameterDefinition<Value> =
  | RequiredPathParameterDefinition<Value>
  | OptionalPathParameterDefinition<Value>;
export type NamedPathParameterDefinition<Value> = PathParameterDefinition<
  Value
> &
  NamedParameterDefinitionPart;

type RequiredQueryParameterDefinition<Value> = BaseQueryParameterDefinition<
  Value
> &
  RequiredParameterDefinitionPart;
type OptionalQueryParameterDefinition<Value> = BaseQueryParameterDefinition<
  Value
> &
  OptionalParameterDefinitionPart;
export type QueryParameterDefinition<Value> =
  | RequiredQueryParameterDefinition<Value>
  | OptionalQueryParameterDefinition<Value>;
export type NamedQueryParameterDefinition<Value> = QueryParameterDefinition<
  Value
> &
  NamedParameterDefinitionPart;

type RequiredStateParameterDefinition<Value> = BaseStateParameterDefinition<
  Value
> &
  RequiredParameterDefinitionPart;
type OptionalStateParameterDefinition<Value> = BaseStateParameterDefinition<
  Value
> &
  OptionalParameterDefinitionPart;
export type StateParameterDefinition<Value> =
  | RequiredStateParameterDefinition<Value>
  | OptionalStateParameterDefinition<Value>;
export type NamedStateParameterDefinition<Value> = StateParameterDefinition<
  Value
> &
  NamedParameterDefinitionPart;

export type ParameterDefinition<Value> =
  | PathParameterDefinition<Value>
  | QueryParameterDefinition<Value>
  | StateParameterDefinition<Value>;
export type NamedParameterDefinition<Value> =
  | NamedPathParameterDefinition<Value>
  | NamedQueryParameterDefinition<Value>
  | NamedStateParameterDefinition<Value>;

const noMatch = Symbol("noMatch");

const number: ValueSerializer<number> = {
  parse: raw => {
    if (!isNumeric(raw)) {
      return noMatch;
    }

    return parseFloat(raw);
  },
  toString: value => value.toString()
};

function isNumeric(value: string) {
  return !isNaN(parseFloat(value)) && /\-?\d*\.?\d*/.test(value);
}

const string: ValueSerializer<string> = {
  parse: raw => raw,
  toString: value => value
};

export const param = {
  path: {
    string: getRequiredPathParameterDefinition(string, false),
    number: getRequiredPathParameterDefinition(number, false),
    ofType: <Value>(valueSerializer: ValueSerializer<Value> = json<Value>()) =>
      getRequiredPathParameterDefinition(valueSerializer, false),
    optional: {
      string: getOptionalPathParameterDefinition(string, false),
      number: getOptionalPathParameterDefinition(number, false),
      ofType: <Value>(
        valueSerializer: ValueSerializer<Value> = json<Value>()
      ) => getOptionalPathParameterDefinition(valueSerializer, false)
    },
    trailing: {
      string: getRequiredPathParameterDefinition(string, true),
      number: getRequiredPathParameterDefinition(number, true),
      ofType: <Value>(
        valueSerializer: ValueSerializer<Value> = json<Value>()
      ) => getRequiredPathParameterDefinition(valueSerializer, true),
      optional: {
        string: getOptionalPathParameterDefinition(string, true),
        number: getOptionalPathParameterDefinition(number, true),
        ofType: <Value>(
          valueSerializer: ValueSerializer<Value> = json<Value>()
        ) => getOptionalPathParameterDefinition(valueSerializer, true)
      }
    }
  },
  query: {
    string: getRequiredQueryParameterDefinition(string),
    number: getRequiredQueryParameterDefinition(number),
    ofType: <Value>(valueSerializer: ValueSerializer<Value> = json<Value>()) =>
      getRequiredQueryParameterDefinition(valueSerializer),
    optional: {
      string: getOptionalQueryParameterDefinition(string),
      number: getOptionalQueryParameterDefinition(number),
      ofType: <Value>(
        valueSerializer: ValueSerializer<Value> = json<Value>()
      ) => getOptionalQueryParameterDefinition(valueSerializer)
    }
  },
  state: {
    string: getRequiredStateParameterDefinition(string),
    number: getRequiredStateParameterDefinition(number),
    ofType: <Value>(valueSerializer: ValueSerializer<Value> = json<Value>()) =>
      getRequiredStateParameterDefinition(valueSerializer),
    optional: {
      string: getOptionalStateParameterDefinition(string),
      number: getOptionalStateParameterDefinition(number),
      ofType: <Value>(
        valueSerializer: ValueSerializer<Value> = json<Value>()
      ) => getOptionalStateParameterDefinition(valueSerializer)
    }
  }
};

function getRequiredPathParameterDefinition<Value>(
  valueSerializer: ValueSerializer<Value>,
  trailing: boolean
): RequiredPathParameterDefinition<Value> {
  return {
    type: "path",
    optional: false,
    trailing,
    valueSerializer
  };
}

function getOptionalPathParameterDefinition<Value>(
  valueSerializer: ValueSerializer<Value>,
  trailing: boolean
): OptionalPathParameterDefinition<Value> {
  return {
    type: "path",
    optional: true,
    trailing,
    valueSerializer
  };
}

function getRequiredQueryParameterDefinition<Value>(
  valueSerializer: ValueSerializer<Value>
): RequiredQueryParameterDefinition<Value> {
  return {
    type: "query",
    optional: false,
    valueSerializer
  };
}

function getOptionalQueryParameterDefinition<Value>(
  valueSerializer: ValueSerializer<Value>
): OptionalQueryParameterDefinition<Value> {
  return {
    type: "query",
    optional: true,
    valueSerializer
  };
}

function getRequiredStateParameterDefinition<Value>(
  valueSerializer: ValueSerializer<Value>
): RequiredStateParameterDefinition<Value> {
  return {
    type: "state",
    optional: false,
    valueSerializer
  };
}

function getOptionalStateParameterDefinition<Value>(
  valueSerializer: ValueSerializer<Value>
): OptionalStateParameterDefinition<Value> {
  return {
    type: "state",
    optional: true,
    valueSerializer
  };
}

function json<Value = unknown>() {
  const paramType: ValueSerializer<Value> = {
    parse: raw => {
      let value: Value;

      try {
        value = JSON.parse(raw);
      } catch {
        return noMatch;
      }

      return value;
    },
    toString: value => JSON.stringify(value)
  };

  return paramType;
}
