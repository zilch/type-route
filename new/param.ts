import { Param, ParamType, ParamValueSerializer } from "./types";
import { noMatch } from "./constants";

const number: ParamValueSerializer<number> = {
  parse: raw => {
    if (!isNumeric(raw)) {
      return noMatch;
    }

    return parseFloat(raw);
  },
  toString: value => value.toString()
};

const string: ParamValueSerializer<string> = {
  parse: raw => raw,
  toString: value => value
};

const path = "path" as const;
const query = "query" as const;
const state = "state" as const;
const required = "required" as const;
const optional = "optional" as const;
const trailing = "trailing" as const;

export const param = {
  path: {
    string: getParam(path, string, required),
    number: getParam(path, number, required),
    ofType: getParamBuilder(path, required),
    optional: {
      string: getParam(path, string, optional),
      number: getParam(path, number, optional),
      ofType: getParamBuilder(path, optional)
    },
    trailing: {
      string: getParam(path, string, required, trailing),
      number: getParam(path, number, required, trailing),
      ofType: getParamBuilder(path, required, trailing),
      optional: {
        string: getParam(path, string, optional, trailing),
        number: getParam(path, number, optional, trailing),
        ofType: getParamBuilder(path, optional, trailing)
      }
    }
  },
  query: {
    string: getParam(query, string, required),
    number: getParam(query, number, required),
    ofType: getParamBuilder(query, required),
    optional: {
      string: getParam(query, string, optional),
      number: getParam(query, number, optional),
      ofType: getParamBuilder(query, optional)
    }
  },
  state: {
    string: getParam(state, string, required),
    number: getParam(state, number, required),
    ofType: getParamBuilder(state, required),
    optional: {
      string: getParam(state, string, optional),
      number: getParam(state, number, optional),
      ofType: getParamBuilder(state, optional)
    }
  }
};

function getParam<T, O, V = unknown>(
  paramType: T,
  paramValueSerializer: ParamValueSerializer<V>,
  optionality: O,
  trailing?: "trailing"
) {
  const param: Param<T, O, V> = {
    _internal: {
      paramType,
      paramValueSerializer,
      optionality,
      trailing: !!trailing
    }
  };

  return param;
}

function getParamBuilder<O>(
  paramType: ParamType,
  optionality: O,
  trailing?: "trailing"
) {
  return <T = unknown>(
    paramValueSerializer: ParamValueSerializer<T> = json<T>()
  ) => getParam(paramType, paramValueSerializer, optionality, trailing);
}

function json<T = unknown>() {
  const paramType: ParamValueSerializer<T> = {
    parse: raw => {
      let value: T;

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

function isNumeric(value: string) {
  return !isNaN(parseFloat(value)) && /\-?\d*\.?\d*/.test(value);
}
