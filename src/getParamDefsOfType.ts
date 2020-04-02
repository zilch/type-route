import { ParamDefType, ParamDefCollection } from "./types";

export function getParamDefsOfType<TParamType extends ParamDefType>(
  type: TParamType,
  paramDefCollection: ParamDefCollection<ParamDefType>
) {
  const filteredParamDefCollection: ParamDefCollection<TParamType> = {};

  Object.keys(paramDefCollection).forEach(name => {
    const paramDef = paramDefCollection[name];
    if (paramDef._internal.type === type) {
      filteredParamDefCollection[name] = paramDef as ParamDefCollection<
        TParamType
      >[string];
    }
  });

  return filteredParamDefCollection;
}
