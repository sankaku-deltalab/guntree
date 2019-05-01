import { IFiringState, IFireData } from "guntree/firing-state";
import { ModifyParameterModifier } from "guntree/elements/gunModifier";
import { simpleMock } from "../util";

const createFireData = (parameters: Map<string, number>): IFireData => {
  const fd = simpleMock<IFireData>();
  fd.parameters = parameters;
  return fd;
};

describe("#ModifyParameterModifier", (): void => {
  test("modify already set parameter", (): void => {
    // Given firing state
    const state = simpleMock<IFiringState>();

    // And FireData with parameter
    const name = "a";
    const initialValue = 0.5;
    const fd = createFireData(new Map([[name, initialValue]]));

    // And ModifyParameterModifier
    const value = 1;
    const modifier = jest.fn().mockReturnValueOnce(value);
    const setParameterMod = new ModifyParameterModifier(name, modifier);

    // When play SetParameterImmediately
    setParameterMod.modifyFireData(state, fd);

    // Then parameter was set
    expect(fd.parameters).toEqual(new Map([[name, value]]));
  });

  test("can not modify unset parameter", (): void => {
    // Given firing state
    const state = simpleMock<IFiringState>();

    // And FireData with parameter
    const name = "a";
    const initialValue = 0.5;
    const fd = createFireData(new Map([[name, initialValue]]));

    // And ModifyParameterModifier with unset name
    const unsetName = "b";
    const value = 1;
    const modifier = jest.fn().mockReturnValueOnce(value);
    const setParameterMod = new ModifyParameterModifier(unsetName, modifier);

    // When play SetParameterImmediately
    const mod = (): void => setParameterMod.modifyFireData(state, fd);

    // Then error was thrown
    expect(mod).toThrow(Error);
  });
});
