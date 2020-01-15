import * as mat from "transformation-matrix";

import {
  FiringState,
  FireData,
  DefaultFiringState,
  DefaultFireData,
  DefaultRepeatStateManager
} from "guntree/firing-state";
import { Alternate, Fire } from "guntree/elements/gun";
import { InvertTransformModifier } from "guntree/elements";
import { Muzzle } from "guntree/muzzle";
import { decomposeTransform } from "guntree/transform-util";
import {
  simpleMock,
  createGunMockConsumeFrames,
  createFiringStateMock
} from "../util";

const createFiringState = (...clones: FiringState[]): FiringState => {
  const state = createFiringStateMock(...clones);
  state.pushModifier = jest.fn();
  return state;
};

describe("#Alternate", (): void => {
  test("play child gun and inverted child gun as sequential", (): void => {
    // Given FiringState
    const stateClone1 = createFiringState();
    const stateClone2 = createFiringState();
    const state = createFiringState(stateClone1, stateClone2);

    // And Alternate with child gun
    const childGun = createGunMockConsumeFrames(0);
    const alternate = new Alternate({}, childGun);

    // When play Alternate
    const progress = alternate.play(state);
    while (true) {
      const r = progress.next();
      if (r.done) break;
    }

    // Then child gun played twice
    expect(childGun.play).toBeCalledWith(stateClone1);
    expect(childGun.play).toBeCalledWith(stateClone2);
  });

  test("invert angle in second firing", (): void => {
    // Given FiringState
    const defaultAngle = 30;
    const state = new DefaultFiringState(
      simpleMock(),
      new DefaultFireData(),
      new DefaultRepeatStateManager()
    );
    state.fireData.transform = mat.rotateDEG(defaultAngle);
    const muzzle = simpleMock<Muzzle>();
    muzzle.getMuzzleTransform = jest.fn().mockReturnValue(mat.translate(0));
    muzzle.fire = jest.fn();
    state.muzzle = muzzle;

    // And Alternate with fire gun
    const mirror = new Alternate({}, new Fire(simpleMock()));

    // When play Alternate
    mirror.play(state).next();

    // Then seconds firing angle was inverted
    const muzzleFire = muzzle.fire as jest.Mock;
    const actualFireData1 = muzzleFire.mock.calls[0][0] as FireData;
    const [_, actualAngle1, __] = decomposeTransform(actualFireData1.transform);
    const actualFireData2 = muzzleFire.mock.calls[1][0] as FireData;
    const [___, actualAngle2, ____] = decomposeTransform(
      actualFireData2.transform
    );
    expect(actualAngle1).toBeCloseTo(defaultAngle);
    expect(actualAngle2).toBeCloseTo(-defaultAngle);
  });

  test("can specify another muzzle for inverted firing", (): void => {
    // Given FiringState
    const muzzle = simpleMock<Muzzle>();
    const stateClone1 = createFiringState();
    const stateClone2 = createFiringState();
    const state = createFiringState(stateClone1, stateClone2);
    const getMuzzleByName = jest.fn().mockReturnValueOnce(muzzle);
    state.getMuzzleByName = getMuzzleByName;
    stateClone1.getMuzzleByName = getMuzzleByName;
    stateClone2.getMuzzleByName = getMuzzleByName;

    // And Alternate with child gun
    const muzzleName = "a";
    const childGun = createGunMockConsumeFrames(0);
    const alternate = new Alternate(
      { invertedMuzzleName: muzzleName },
      childGun
    );

    // When play Alternate
    const progress = alternate.play(state);
    while (true) {
      const r = progress.next();
      if (r.done) break;
    }

    // Then child gun played twice
    expect(childGun.play).toBeCalledWith(stateClone1);
    expect(childGun.play).toBeCalledWith(stateClone2);

    // And second playing state was set muzzle
    expect(stateClone2.muzzle).toBe(muzzle);
    expect(state.getMuzzleByName).toBeCalledWith(muzzleName);
  });

  test("consume frames equal to double of child frames", (): void => {
    // Given FiringState
    const stateClone1 = createFiringState();
    const stateClone2 = createFiringState();
    const state = createFiringState(stateClone1, stateClone2);

    // And Alternate with child gun
    const childFrames = 6;
    const childGun = createGunMockConsumeFrames(childFrames);
    const alternate = new Alternate({}, childGun);

    // When play Alternate
    let consumedFrames = 0;
    const progress = alternate.play(state);
    while (true) {
      const r = progress.next();
      if (r.done) break;
      consumedFrames += 1;
    }

    // Then consume frames equal to double of child frames
    expect(consumedFrames).toBe(childFrames * 2);
  });

  test("can invert translation x", (): void => {
    // Given FiringState
    const defaultTransX = 0.25;
    const state = new DefaultFiringState(
      simpleMock(),
      new DefaultFireData(),
      new DefaultRepeatStateManager()
    );
    state.fireData.transform = mat.translate(defaultTransX, 0);
    const muzzle = simpleMock<Muzzle>();
    muzzle.getMuzzleTransform = jest.fn().mockReturnValue(mat.translate(0));
    muzzle.fire = jest.fn();
    state.muzzle = muzzle;

    // And Alternate with fire gun
    const mirror = new Alternate(
      { mirrorTranslationX: true },
      new Fire(simpleMock())
    );

    // When play Alternate
    mirror.play(state).next();

    // Then seconds firing translation x was inverted
    const muzzleFire = muzzle.fire as jest.Mock;
    const actualFireData1 = muzzleFire.mock.calls[0][0] as FireData;
    const [actualTrans1, _, __] = decomposeTransform(actualFireData1.transform);
    const actualFireData2 = muzzleFire.mock.calls[1][0] as FireData;
    const [actualTrans2, ___, ____] = decomposeTransform(
      actualFireData2.transform
    );
    expect(actualTrans1.x).toBeCloseTo(defaultTransX);
    expect(actualTrans2.x).toBeCloseTo(-defaultTransX);
  });

  test("can invert translation y", (): void => {
    // Given FiringState
    const defaultTransY = 0.25;
    const state = new DefaultFiringState(
      simpleMock(),
      new DefaultFireData(),
      new DefaultRepeatStateManager()
    );
    state.fireData.transform = mat.translate(0, defaultTransY);
    const muzzle = simpleMock<Muzzle>();
    muzzle.getMuzzleTransform = jest.fn().mockReturnValue(mat.translate(0));
    muzzle.fire = jest.fn();
    state.muzzle = muzzle;

    // And Alternate with fire gun
    const mirror = new Alternate(
      { mirrorTranslationY: true },
      new Fire(simpleMock())
    );

    // When play Alternate
    mirror.play(state).next();

    // Then seconds firing translation y was inverted
    const muzzleFire = muzzle.fire as jest.Mock;
    const actualFireData1 = muzzleFire.mock.calls[0][0] as FireData;
    const [actualTrans1, _, __] = decomposeTransform(actualFireData1.transform);
    const actualFireData2 = muzzleFire.mock.calls[1][0] as FireData;
    const [actualTrans2, ___, ____] = decomposeTransform(
      actualFireData2.transform
    );
    expect(actualTrans1.y).toBeCloseTo(defaultTransY);
    expect(actualTrans2.y).toBeCloseTo(-defaultTransY);
  });
});
