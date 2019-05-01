import { FiringState, FireData } from "guntree/firing-state";
import { SetMuzzleImmediatelyModifier } from "guntree/elements/gunModifier";
import { Muzzle } from "guntree/muzzle";
import { simpleMock, createLazyEvaluativeMockReturnOnce } from "../util";

const createFiringState = (muzzle: Muzzle): FiringState => {
  const state = simpleMock<FiringState>();
  state.muzzle = null;
  state.getMuzzleByName = jest.fn().mockReturnValueOnce(muzzle);
  return state;
};

describe("#SetMuzzleImmediatelyModifier", (): void => {
  test("can set muzzle gotten from FiringState", (): void => {
    // Given Muzzle
    const muzzle = simpleMock<Muzzle>();

    // And firing state
    const state = createFiringState(muzzle);

    // And FireData
    const fd = simpleMock<FireData>();

    // And SetMuzzleImmediatelyModifier
    const name = "a";
    const setMuzzle = new SetMuzzleImmediatelyModifier(name);

    // When modify SetMuzzleImmediatelyModifier
    setMuzzle.modifyFireData(state, fd);

    // Then muzzle was set
    expect(state.muzzle).toBe(muzzle);

    // And set muzzle was gotten from state.getMuzzleByName
    expect(state.getMuzzleByName).toBeCalledWith(name);
  });

  test("can set muzzle name with lazyEvaluative value", (): void => {
    // Given Muzzle
    const muzzle = simpleMock<Muzzle>();

    // And firing state
    const state = createFiringState(muzzle);

    // And FireData
    const fd = simpleMock<FireData>();

    // And SetMuzzleImmediatelyModifier
    const nameConst = "a";
    const nameLe = createLazyEvaluativeMockReturnOnce(nameConst);
    const setMuzzle = new SetMuzzleImmediatelyModifier(nameLe);

    // When modify SetMuzzleImmediatelyModifier
    setMuzzle.modifyFireData(state, fd);

    // Then muzzle was set
    expect(state.muzzle).toBe(muzzle);

    // And set muzzle was gotten from state.getMuzzleByName
    expect(state.getMuzzleByName).toBeCalledWith(nameConst);
  });
});
