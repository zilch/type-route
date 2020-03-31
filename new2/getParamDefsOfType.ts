import { ParamDefType, ParamDefCollection } from "./param";

export function getParamDefsOfType<TParamType extends ParamDefType>(
  type: TParamType,
  paramDefCollection: ParamDefCollection
) {
  const filteredParamDefCollection: ParamDefCollection<TParamType> = {};

  Object.keys(paramDefCollection).forEach(name => {
    const paramDef = paramDefCollection[name];
    if (paramDef.type === type) {
      filteredParamDefCollection[name] = paramDef as ParamDefCollection<
        TParamType
      >[string];
    }
  });

  return filteredParamDefCollection;
}
