import { ParamDefKind, ParamDefCollection } from "./types";

export function getParamDefsOfType<TParamType extends ParamDefKind>(
  type: TParamType,
  paramDefCollection: ParamDefCollection<ParamDefKind>
) {
  const filteredParamDefCollection: ParamDefCollection<TParamType> = {};

  Object.keys(paramDefCollection).forEach(name => {
    const paramDef = paramDefCollection[name];
    if (paramDef._internal.kind === type) {
      filteredParamDefCollection[name] = paramDef as ParamDefCollection<
        TParamType
      >[string];
    }
  });

  return filteredParamDefCollection;
}
