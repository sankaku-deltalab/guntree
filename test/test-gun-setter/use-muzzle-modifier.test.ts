import { FiringState, FireData } from "guntree/firing-state";
import { UseMuzzleUpdater } from "guntree/elements/gunSetter";
import { Muzzle } from "guntree/muzzle";
import { simpleMock, createLazyEvaluativeMockReturnOnce } from "../util";

const createFiringState = (muzzle: Muzzle): FiringState => {
  const state = simpleMock<FiringState>();
  state.muzzle = null;
  state.getMuzzleByName = jest.fn().mockReturnValueOnce(muzzle);
  return state;
};

describe("#UseMuzzleUpdater", (): void => {
  test("can set muzzle gotten from FiringState", (): void => {
    // Given Muzzle
    const muzzle = simpleMock<Muzzle>();

    // And firing state
    const state = createFiringState(muzzle);

    // And FireData
    const fd = simpleMock<FireData>();

    // And UseMuzzleUpdater
    const name = "a";
    const setMuzzle = new UseMuzzleUpdater(name);

    // When use UseMuzzleUpdater
    setMuzzle.updateFiringState(state);

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

    // And UseMuzzleUpdater
    const nameConst = "a";
    const nameLe = createLazyEvaluativeMockReturnOnce(nameConst);
    const setMuzzle = new UseMuzzleUpdater(nameLe);

    // When use UseMuzzleUpdater
    setMuzzle.updateFiringState(state);

    // Then muzzle was set
    expect(state.muzzle).toBe(muzzle);

    // And set muzzle was gotten from state.getMuzzleByName
    expect(state.getMuzzleByName).toBeCalledWith(nameConst);
  });
});
