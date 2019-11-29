import { FiringState, FireData } from "guntree/firing-state";
import { UseParameterUpdater } from "guntree/elements/gunSetter";
import { simpleMock, createLazyEvaluativeMockReturnOnce } from "../util";

const createFireData = (parameters: Map<string, number>): FireData => {
  const fd = simpleMock<FireData>();
  fd.parameters = parameters;
  return fd;
};

describe("#UseParameterUpdater", (): void => {
  test("can set value with unset name", (): void => {
    // Given firing state
    const state = simpleMock<FiringState>();

    // And FireData
    state.fireData = createFireData(new Map());

    // And UseParameterUpdater
    const name = "a";
    const value = 1;
    const setParameterMod = new UseParameterUpdater(name, value);

    // When use UseParameterUpdater
    setParameterMod.updateFiringState(state);

    // Then parameter was set
    expect(state.fireData.parameters).toEqual(new Map([[name, value]]));
  });

  test("can set value with already set name", (): void => {
    // Given firing state
    const state = simpleMock<FiringState>();

    // And FireData with parameter
    const name = "a";
    const initialValue = 0.5;
    state.fireData = createFireData(new Map([[name, initialValue]]));

    // And UseParameterUpdater
    const value = 1;
    const setParameterMod = new UseParameterUpdater(name, value);

    // When use UseParameterUpdater
    setParameterMod.updateFiringState(state);

    // Then parameter was set
    expect(state.fireData.parameters).toEqual(new Map([[name, value]]));
  });

  test("can set value with lazyEvaluative value", (): void => {
    // Given firing state
    const state = simpleMock<FiringState>();

    // And FireData
    state.fireData = createFireData(new Map());

    // And UseParameterUpdater
    const name = "a";
    const valueConst = 1;
    const valueLe = createLazyEvaluativeMockReturnOnce(valueConst);
    const setParameterMod = new UseParameterUpdater(name, valueLe);

    // When use UseParameterUpdater
    setParameterMod.updateFiringState(state);

    // Then parameter was set
    expect(state.fireData.parameters).toEqual(new Map([[name, valueConst]]));
  });
});
