import { range } from "lodash";
import * as mat from "transformation-matrix";

import {
  DefaultFiringState,
  FireData,
  FireDataModifier,
  RepeatStateManager
} from "guntree/firing-state";
import { Player } from "guntree/player";
import { Bullet } from "guntree/bullet";
import { Muzzle } from "guntree/muzzle";
import { simpleMock } from "./util";

const createSimpleFireDataMock = (): [FireData, FireData] => {
  const fireData = simpleMock<FireData>();
  const fireDataClone = simpleMock<FireData>();
  fireData.copy = jest.fn().mockReturnValueOnce(fireDataClone);
  return [fireData, fireDataClone];
};

const createSimpleRSMMock = (): [RepeatStateManager, RepeatStateManager] => {
  const rsm = simpleMock<RepeatStateManager>();
  const rsmClone = simpleMock<RepeatStateManager>();
  rsm.copy = jest.fn().mockReturnValueOnce(rsmClone);
  return [rsm, rsmClone];
};

describe("#FiringState", (): void => {
  test("can add modifier and apply their", (): void => {
    // Given FireData with clone
    const [fireData, fireDataClone] = createSimpleFireDataMock();
    fireDataClone.transform = mat.translate(0);

    // And muzzle with transform
    const muzzle = simpleMock<Muzzle>();
    muzzle.getMuzzleTransform = jest.fn().mockReturnValueOnce(mat.translate(0));

    // And FiringState with muzzle and FireData clone
    const state = new DefaultFiringState(
      simpleMock<Player>(),
      fireData,
      simpleMock<RepeatStateManager>()
    );
    state.muzzle = muzzle;
    state.fireData.copy = jest.fn().mockReturnValueOnce(fireDataClone);

    // And modifiers
    const calledModifiers: FireDataModifier[] = [];
    const modifiers = range(3).map(
      (): FireDataModifier => {
        const mod = simpleMock<FireDataModifier>();
        mod.modifyFireData = jest
          .fn()
          .mockImplementation((): number => calledModifiers.push(mod));
        return mod;
      }
    );

    // When push modifiers to FiringState
    modifiers.map((m): void => state.pushModifier(m));

    // And calc modified fireData
    state.calcModifiedFireData();

    // Then modifiers are called with fireData copy
    modifiers.map(
      (mod): void => {
        expect(mod.modifyFireData).toBeCalledWith(state, fireDataClone);
        expect(mod.modifyFireData).toBeCalledTimes(1);
      }
    );

    // And modifiers are called as reversed order
    expect(calledModifiers).toEqual(modifiers.reverse());
  });

  test("can copy with fireData", (): void => {
    // Given FireData with clone
    const [fireData, fireDataClone] = createSimpleFireDataMock();

    // And RepeatStateManager with clone
    const [rsm, _rsmClone] = createSimpleRSMMock();

    // And FiringState
    const state = new DefaultFiringState(simpleMock(), fireData, rsm);

    // When copy FiringState
    const clone = state.copy();

    // Then copy's fireData is original's clone
    expect(clone.fireData).toBe(fireDataClone);
  });

  test("can copy with repeatStates", (): void => {
    // Given FireData with clone
    const [fireData, _fireDataClone] = createSimpleFireDataMock();

    // And RepeatStateManager with clone
    const [rsm, rsmClone] = createSimpleRSMMock();

    // And FiringState
    const state = new DefaultFiringState(simpleMock(), fireData, rsm);

    // When copy FiringState
    const clone = state.copy();

    // Then copy's repeatStates is original's clone
    expect(clone.repeatStates).toBe(rsmClone);
  });

  test("can copy with muzzle", (): void => {
    // Given FireData with clone
    const [fireData, _fireDataClone] = createSimpleFireDataMock();

    // And RepeatStateManager with clone
    const [rsm, _rsmClone] = createSimpleRSMMock();

    // And Muzzle
    const muzzle = simpleMock<Muzzle>();

    // Given FiringState with muzzle
    const state = new DefaultFiringState(simpleMock(), fireData, rsm);
    state.muzzle = muzzle;

    // When copy FiringState
    const clone = state.copy();

    // Then copy's repeatStates is original's clone
    expect(clone.muzzle).toBe(muzzle);
  });

  test("can get muzzle by name", (): void => {
    // Given Player with muzzle
    const muzzle = simpleMock<Muzzle>();
    const player = simpleMock<Player>();
    player.getMuzzle = jest.fn().mockReturnValueOnce(muzzle);

    // And FiringState
    const state = new DefaultFiringState(player, simpleMock(), simpleMock());

    // When get muzzle by name
    const muzzleName = "a";
    const gottenMuzzle = state.getMuzzleByName(muzzleName);

    // Then gotten muzzle is Player's muzzle
    expect(gottenMuzzle).toBe(muzzle);
    expect(player.getMuzzle).toBeCalledWith(muzzleName);
  });

  test("can call fire and pass firing to muzzle", (): void => {
    // Given Muzzle can fire
    const muzzle = simpleMock<Muzzle>();
    muzzle.fire = jest.fn();

    // And RepeatStateManager with clone
    const rsm = simpleMock<RepeatStateManager>();
    const rsmClone = simpleMock<RepeatStateManager>();
    rsm.copy = jest.fn().mockReturnValueOnce(rsmClone);

    // And FiringState with muzzle and can calcModifiedFireData
    const state = new DefaultFiringState(simpleMock(), simpleMock(), rsm);
    state.muzzle = muzzle;
    const modifiedFireData = simpleMock<FireData>();
    state.calcModifiedFireData = jest
      .fn()
      .mockReturnValueOnce(modifiedFireData);

    // And Bullet
    const bullet = simpleMock<Bullet>();

    // When fire
    state.fire(bullet);

    // Then FiringState pass firing to muzzle with modified fire data
    expect(muzzle.fire).toBeCalledWith(modifiedFireData, bullet);
  });

  test("use muzzle transform in calcModifiedFireData", (): void => {
    // Given FireData with clone
    const [fireData, fireDataClone] = createSimpleFireDataMock();
    fireDataClone.transform = mat.translate(0);

    // And RepeatStateManager with clone
    const [rsm, _rsmClone] = createSimpleRSMMock();

    // And muzzle
    const muzzle = simpleMock<Muzzle>();
    const muzzleTrans = mat.translate(1.2, 5.3);
    muzzle.getMuzzleTransform = jest.fn().mockReturnValueOnce(muzzleTrans);

    // And firing state with muzzle and FireData clone
    const state = new DefaultFiringState(simpleMock(), fireData, rsm);
    state.muzzle = muzzle;

    // When calc modified fireData
    const modifiedFD = state.calcModifiedFireData();

    // Then
    expect(modifiedFD.transform).toEqual(muzzleTrans);
  });
});
