import { noMatch } from "./noMatch";
import { ValueSerializer, ParamDefKind, ParamDef, ParamValue } from "./types";
import { assert } from "./assert";

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
  const valueSerializer: ValueSerializer<TValue> = {
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

  return valueSerializer;
};

export const param = {
  path: {
    ...getParamDefKindSection("path", false),
    trailing: getParamDefKindSection("path", true)
  },
  query: getParamDefKindSection("query", false),
  state: getParamDefKindSection("state", false)
};

function getParamDefKindSection<
  TKind extends ParamDefKind,
  TTrailing extends boolean
>(kind: TKind, trailing: TTrailing) {
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
          type: "ParamDef",
          kind,
          optional,
          valueSerializer: string,
          trailing,
          default: undefined as never
        }
      }),

      number: getParamDef({
        _internal: {
          type: "ParamDef",
          kind,
          optional,
          valueSerializer: number,
          trailing,
          default: undefined as never
        }
      }),

      ofType<TValue = unknown>(
        valueSerializer: ValueSerializer<TValue> = json<TValue>()
      ) {
        assert("[ParamDef].ofType", [
          assert.numArgs([].slice.call(arguments), 0, 1),
          assert.type("object", "valueSerializer", valueSerializer)
        ]);

        return getParamDef({
          _internal: {
            type: "ParamDef",
            kind,
            optional,
            valueSerializer,
            trailing,
            default: undefined as never
          }
        });
      }
    };
  }

  type GetParamDefResult<
    T extends ParamDef<TKind>
  > = T["_internal"]["optional"] extends true
    ? {
        _internal: T["_internal"];
        default(
          value: ParamValue<T>
        ): {
          _internal: {
            type: "ParamDef";
            kind: T["_internal"]["kind"];
            valueSerializer: T["_internal"]["valueSerializer"];
            optional: T["_internal"]["optional"];
            default: ParamValue<T>;
            trailing: T["_internal"]["trailing"];
          };
        };
      }
    : T;

  function getParamDef<T extends ParamDef<TKind>>({
    _internal
  }: T): GetParamDefResult<T> {
    if (!_internal.optional) {
      return { _internal } as any;
    }

    return {
      _internal,
      default(value: any) {
        assert("[ParamDef].default", [
          assert.numArgs([].slice.call(arguments), 1)
        ]);

        return {
          _internal: { ..._internal, default: value }
        };
      }
    } as any;
  }
}
