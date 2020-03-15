import { FiringState } from "guntree/firing-state";
import { UseParameterUpdater } from "guntree/elements";
import { simpleMock, createLazyEvaluativeMockReturnOnce } from "../util";

describe("#UseParameterUpdater", (): void => {
  test("can set value with unset name", (): void => {
    // Given firing state
    const state = new FiringState();

    // And UseParameterUpdater
    const name = "a";
    const value = 1;
    const setParameterMod = new UseParameterUpdater(name, value);

    // When use UseParameterUpdater
    setParameterMod.updateFiringState(simpleMock(), state);

    // Then parameter was set
    expect(state.parameters.get(name)).toBe(value);
  });

  test("can set value with already set name", (): void => {
    // Given firing state
    const state = new FiringState();

    // And FireData with parameter
    const name = "a";
    const initialValue = 0.5;
    state.parameters.set(name, initialValue);

    // And UseParameterUpdater
    const value = 1;
    const setParameterMod = new UseParameterUpdater(name, value);

    // When use UseParameterUpdater
    setParameterMod.updateFiringState(simpleMock(), state);

    // Then parameter was set
    expect(state.parameters.get(name)).toBe(value);
  });

  test("can set value with lazyEvaluative value", (): void => {
    // Given firing state
    const state = new FiringState();

    // And UseParameterUpdater
    const name = "a";
    const valueConst = 1;
    const valueLe = createLazyEvaluativeMockReturnOnce(valueConst);
    const setParameterMod = new UseParameterUpdater(name, valueLe);

    // When use UseParameterUpdater
    setParameterMod.updateFiringState(simpleMock(), state);

    // Then parameter was set
    expect(state.parameters.get(name)).toBe(valueConst);
  });
});
