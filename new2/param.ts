import { noMatch } from "./noMatch";
import { ValueSerializer, ParamDefType, ParamDef } from "./types";

const number: ValueSerializer<number> = {
  parse: raw => {
    if (!isNumeric(raw)) {
      return noMatch;
    }

    return parseFloat(raw);
  },
  stringify: value => value.toString()
};

function isNumeric(value: string) {
  return !isNaN(parseFloat(value)) && /^\-?\d*\.?\d*$/.test(value);
}

const string: ValueSerializer<string> = {
  parse: raw => raw,
  stringify: value => value
};

const json = <TValue = unknown>() => {
  const paramType: ValueSerializer<TValue> = {
    parse: raw => {
      let value: TValue;

      try {
        value = JSON.parse(raw);
      } catch {
        return noMatch;
      }

      return value;
    },
    stringify: value => JSON.stringify(value)
  };

  return paramType;
};

export const param = {
  path: {
    ...getParamDefTypeSection("path", false),
    trailing: getParamDefTypeSection("path", true)
  },
  query: getParamDefTypeSection("query", false),
  state: getParamDefTypeSection("state", false)
};

function getParamDefTypeSection<
  TType extends ParamDefType,
  TTrailing extends boolean
>(type: TType, trailing: TTrailing) {
  return {
    ...getParamDefOptionalitySection(false),
    optional: {
      ...getParamDefOptionalitySection(true)
    }
  };

  function getParamDefOptionalitySection<TOptional extends boolean>(
    optional: TOptional
  ) {
    return {
      string: getParamDef({
        type,
        optional,
        valueSerializer: string,
        trailing
      }),

      number: getParamDef({
        type,
        optional,
        valueSerializer: number,
        trailing
      }),

      ofType: <TValue = unknown>(
        valueSerializer: ValueSerializer<TValue> = json<TValue>()
      ) =>
        getParamDef({
          type,
          optional,
          valueSerializer,
          trailing
        })
    };
  }

  function getParamDef<T extends ParamDef<TType>>(definition: T) {
    return definition;
  }
}
