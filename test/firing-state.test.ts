import { range } from "lodash";
import * as mat from "transformation-matrix";

import { FiringState } from "guntree/firing-state";
import { FireData } from "guntree/fire-data";
import { RepeatingManager } from "guntree/repeating-manager";
import { Muzzle } from "guntree/muzzle";
import { simpleMock } from "./util";

const createSimpleRSMMock = (): [RepeatingManager, RepeatingManager] => {
  const rsm = simpleMock<RepeatingManager>();
  const rsmClone = simpleMock<RepeatingManager>();
  rsm.copy = jest.fn().mockReturnValueOnce(rsmClone);
  return [rsm, rsmClone];
};

describe("#FiringState", (): void => {
  test("can add modifier and use their", (): void => {
    // Given FiringState with muzzle
    const state = new FiringState(simpleMock<RepeatingManager>());
    const muzzle = simpleMock<Muzzle>();
    muzzle.getMuzzleTransform = jest.fn().mockReturnValueOnce(mat.translate(0));
    state.setMuzzle(muzzle);

    // And modifiers
    const calledModifiers: jest.Mock[] = [];
    const modifiers = range(3).map(
      (): jest.Mock => {
        const mod = jest.fn().mockImplementation(() => {
          calledModifiers.push(mod);
        });
        return mod;
      }
    );

    // When push modifiers to FiringState
    modifiers.map((m): void => state.pushModifier(m));

    // And calc modified fireData
    const fireData = new FireData();
    state.modifyFireData(fireData);

    // Then modifiers are called with fireData copy
    modifiers.map((mod): void => {
      expect(mod).toBeCalledWith(fireData);
      expect(mod).toBeCalledTimes(1);
    });

    // And modifiers are called as reversed order
    expect(calledModifiers).toEqual(modifiers.reverse());
  });

  test("use muzzle transform in calcModifiedFireData", (): void => {
    // Given FiringState with muzzle
    const [rsm, _rsmClone] = createSimpleRSMMock();
    const state = new FiringState(rsm);
    const muzzle = simpleMock<Muzzle>();
    const muzzleTrans = mat.translate(1.2, 5.3);
    muzzle.getMuzzleTransform = jest.fn().mockReturnValueOnce(muzzleTrans);
    state.setMuzzle(muzzle);

    // When calc modified fireData
    const fireData = new FireData();
    state.modifyFireData(fireData);

    // Then
    expect(fireData.transform).toEqual(muzzleTrans);
  });

  test("can copy with repeatStates", (): void => {
    // Given FiringState
    const [rsm, rsmClone] = createSimpleRSMMock();
    const state = new FiringState(rsm);

    // When copy FiringState
    const clone = state.copy();

    // Then copy's repeatStates is original's clone
    expect(clone.repeatStates).toBe(rsmClone);
  });

  test("can copy with muzzle", (): void => {
    // Given FiringState with muzzle
    const state = new FiringState();
    const muzzle = simpleMock<Muzzle>();
    state.setMuzzle(muzzle);

    // When copy FiringState
    const clone = state.copy();

    // Then copy's muzzle is original's
    expect(clone.getMuzzle()).toBe(muzzle);
  });

  test("can copy with parameters", (): void => {
    // Given FiringState with muzzle
    const params = new Map([
      ["a", 1],
      ["b", 2]
    ]);
    const state = new FiringState();
    state.parameters = params;

    // When copy FiringState
    const clone = state.copy();

    // Then copy's parameters is original's copy
    expect(clone.parameters).toEqual(params);
  });
});
