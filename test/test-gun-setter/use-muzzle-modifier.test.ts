import { FiringState } from "guntree/firing-state";
import { UseMuzzleUpdater } from "guntree/elements";
import { RawMuzzle } from "guntree/raw-muzzle";
import { Owner } from "guntree/owner";
import { simpleMock, createLazyEvaluativeMockReturnOnce } from "../util";

describe("#UseMuzzleUpdater", (): void => {
  test("can set muzzle gotten from FiringState", (): void => {
    // Given firing state
    const state = new FiringState();

    // And UseMuzzleUpdater
    const name = "a";
    const setMuzzle = new UseMuzzleUpdater(name);

    // When use UseMuzzleUpdater
    const owner = simpleMock<Owner>();
    setMuzzle.updateFiringState(owner, state);

    // Then muzzle was set
    expect(state.getMuzzle()).toEqual(new RawMuzzle(owner, name));
  });

  test("can set muzzle name with lazyEvaluative value", (): void => {
    // Given firing state
    const state = new FiringState();

    // And UseMuzzleUpdater
    const nameConst = "a";
    const nameLe = createLazyEvaluativeMockReturnOnce(nameConst);
    const setMuzzle = new UseMuzzleUpdater(nameLe);

    // When use UseMuzzleUpdater
    const owner = simpleMock<Owner>();
    setMuzzle.updateFiringState(owner, state);

    // Then set muzzle was gotten from state.getMuzzleByName
    expect(state.getMuzzle()).toEqual(new RawMuzzle(owner, nameConst));
  });
});
