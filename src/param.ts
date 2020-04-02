import { noMatch } from "./noMatch";
import { ValueSerializer, ParamDefType, ParamDef, ParamValue } from "./types";

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
        _internal: {
          type,
          optional,
          valueSerializer: string,
          trailing,
          default: undefined
        }
      }),

      number: getParamDef({
        _internal: {
          type,
          optional,
          valueSerializer: number,
          trailing,
          default: undefined
        }
      }),

      ofType: <TValue = unknown>(
        valueSerializer: ValueSerializer<TValue> = json<TValue>()
      ) =>
        getParamDef({
          _internal: {
            type,
            optional,
            valueSerializer,
            trailing,
            default: undefined
          }
        })
    };
  }

  type GetParamDefResult<
    T extends ParamDef<TType>
  > = T["_internal"]["optional"] extends true
    ? {
        _internal: T["_internal"];
        default(
          value: ParamValue<T>
        ): {
          _internal: {
            type: T["_internal"]["type"];
            valueSerializer: T["_internal"]["valueSerializer"];
            optional: T["_internal"]["optional"];
            default: ParamValue<T>;
            trailing: T["_internal"]["trailing"];
          };
        };
      }
    : T;

  function getParamDef<T extends ParamDef<TType>>({
    _internal
  }: T): GetParamDefResult<T> {
    if (!_internal.optional) {
      return { _internal } as any;
    }

    return {
      _internal,
      default(value: any) {
        return {
          _internal: { ..._internal, default: value }
        };
      }
    } as any;
  }
}
