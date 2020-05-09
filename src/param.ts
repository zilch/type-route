import { noMatch } from "./noMatch";
import { ValueSerializer, ParamDefKind, ParamDef, ParamValue } from "./types";
import { assert } from "./assert";

const boolean: ValueSerializer<boolean> = {
  id: "boolean",
  parse: (raw) => (raw === "true" ? true : raw === "false" ? false : noMatch),
  stringify: (value) => (value ? "true" : "false"),
};

const number: ValueSerializer<number> = {
  id: "number",
  parse: (raw) => {
    if (!isNumeric(raw)) {
      return noMatch;
    }

    return parseFloat(raw);
  },
  stringify: (value) => value.toString(),
};

function isNumeric(value: string) {
  return !isNaN(parseFloat(value)) && /^-?\d*\.?\d*$/.test(value);
}

const string: ValueSerializer<string> = {
  id: "string",
  parse: (raw) => raw,
  stringify: (value) => value,
};

const json = <TValue = unknown>() => {
  const valueSerializer: ValueSerializer<TValue> = {
    id: "json",
    parse: (raw) => {
      let value: TValue;

      try {
        value = JSON.parse(raw);
      } catch {
        return noMatch;
      }

      return value;
    },
    stringify: (value) => JSON.stringify(value),
  };

  return valueSerializer;
};

export const param = {
  path: {
    ...getParamDefKindSection("path", false),
    trailing: getParamDefKindSection("path", true),
  },
  query: getParamDefKindSection("query", false),
  state: getParamDefKindSection("state", false),
};

function getParamDefKindSection<
  TKind extends ParamDefKind,
  TTrailing extends boolean
>(kind: TKind, trailing: TTrailing) {
  return {
    ...getParamDefOptionalitySection(false, false),
    array: getParamDefOptionalitySection(false, true),
    optional: {
      ...getParamDefOptionalitySection(true, false),
      array: getParamDefOptionalitySection(true, true),
    },
  };

  function getParamDefOptionalitySection<
    TOptional extends boolean,
    TArray extends boolean
  >(optional: TOptional, array: TArray) {
    return {
      string: getParamDef({
        "~internal": {
          type: "ParamDef",
          array,
          kind,
          optional,
          valueSerializer: string,
          trailing,
          default: undefined as never,
        },
      }),

      number: getParamDef({
        "~internal": {
          type: "ParamDef",
          array,
          kind,
          optional,
          valueSerializer: number,
          trailing,
          default: undefined as never,
        },
      }),

      boolean: getParamDef({
        "~internal": {
          type: "ParamDef",
          array,
          kind,
          optional,
          valueSerializer: boolean,
          trailing,
          default: undefined as never,
        },
      }),

      ofType<TValue = unknown>(
        valueSerializer: ValueSerializer<TValue> = json<TValue>()
      ) {
        assert("[ParamDef].ofType", [
          assert.numArgs([].slice.call(arguments), 0, 1),
          assert.type("object", "valueSerializer", valueSerializer),
        ]);

        return getParamDef({
          "~internal": {
            type: "ParamDef",
            array,
            kind,
            optional,
            valueSerializer,
            trailing,
            default: undefined as never,
          },
        });
      },
    };
  }

  type GetParamDefResult<
    T extends ParamDef<TKind>
  > = T["~internal"]["optional"] extends true
    ? {
        ["~internal"]: T["~internal"];
        default(
          value: ParamValue<T>
        ): {
          ["~internal"]: {
            type: "ParamDef";
            kind: T["~internal"]["kind"];
            array: T["~internal"]["array"];
            valueSerializer: T["~internal"]["valueSerializer"];
            optional: T["~internal"]["optional"];
            default: ParamValue<T>;
            trailing: T["~internal"]["trailing"];
          };
        };
      }
    : T;

  function getParamDef<T extends ParamDef<TKind>>({
    "~internal": internal,
  }: T): GetParamDefResult<T> {
    if (!internal.optional) {
      return { "~internal": internal } as any;
    }

    return {
      "~internal": internal,
      default(value: any) {
        assert("[ParamDef].default", [
          assert.numArgs([].slice.call(arguments), 1),
        ]);

        return {
          "~internal": { ...internal, default: value },
        };
      },
    } as any;
  }
}
