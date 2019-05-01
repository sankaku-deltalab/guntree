import { IFiringState, IFireData } from "guntree/firing-state";
import { SetParameterImmediatelyModifier } from "guntree/elements/gunModifier";
import { simpleMock, createLazyEvaluativeMockReturnOnce } from "../util";

const createFireData = (parameters: Map<string, number>): IFireData => {
  const fd = simpleMock<IFireData>();
  fd.parameters = parameters;
  return fd;
};

describe("#SetParameterImmediatelyModifier", (): void => {
  test("can set value with unset name", (): void => {
    // Given firing state
    const state = simpleMock<IFiringState>();

    // And FireData
    const fd = createFireData(new Map());

    // And SetParameterImmediatelyModifier
    const name = "a";
    const value = 1;
    const setParameterMod = new SetParameterImmediatelyModifier(name, value);

    // When modify SetParameterImmediately
    setParameterMod.modifyFireData(state, fd);

    // Then parameter was set
    expect(fd.parameters).toEqual(new Map([[name, value]]));
  });

  test("can set value with already set name", (): void => {
    // Given firing state
    const state = simpleMock<IFiringState>();

    // And FireData with parameter
    const name = "a";
    const initialValue = 0.5;
    const fd = createFireData(new Map([[name, initialValue]]));

    // And SetParameterImmediatelyModifier
    const value = 1;
    const setParameterMod = new SetParameterImmediatelyModifier(name, value);

    // When modify SetParameterImmediately
    setParameterMod.modifyFireData(state, fd);

    // Then parameter was set
    expect(fd.parameters).toEqual(new Map([[name, value]]));
  });

  test("can set value with lazyEvaluative value", (): void => {
    // Given firing state
    const state = simpleMock<IFiringState>();

    // And FireData
    const fd = createFireData(new Map());

    // And SetParameterImmediatelyModifier
    const name = "a";
    const valueConst = 1;
    const valueLe = createLazyEvaluativeMockReturnOnce(valueConst);
    const setParameterMod = new SetParameterImmediatelyModifier(name, valueLe);

    // When modify SetParameterImmediately
    setParameterMod.modifyFireData(state, fd);

    // Then parameter was set
    expect(fd.parameters).toEqual(new Map([[name, valueConst]]));
  });
});
