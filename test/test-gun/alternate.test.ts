import * as mat from "transformation-matrix";

import { IFiringState, IFireData } from "guntree/firing-state";
import { Alternate } from "guntree/elements/gun";
import { InvertTransformModifier } from "guntree/elements";
import { IMuzzle } from "guntree/muzzle";
import { decomposeTransform } from "guntree/transform-util";
import {
  simpleMock,
  createGunMockConsumeFrames,
  createFiringStateMock
} from "../util";

const createFiringState = (...clones: IFiringState[]): IFiringState => {
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

    // And second playing state was pushed InvertModifier
    expect(stateClone2.pushModifier).toBeCalled();
    const pushModifier = stateClone2.pushModifier as jest.Mock;
    const pushedMod = pushModifier.mock.calls[0][0];
    expect(pushedMod).toBeInstanceOf(InvertTransformModifier);
  });

  test("can specify another muzzle for inverted firing", (): void => {
    // Given FiringState
    const muzzle = simpleMock<IMuzzle>();
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

  test("inverted firing inverted angle", (): void => {
    // Given FiringState
    const stateClone1 = createFiringState();
    const stateClone2 = createFiringState();
    const state = createFiringState(stateClone1, stateClone2);

    // And FireData
    const angle = 13;
    const fd = simpleMock<IFireData>();
    fd.transform = mat.rotateDEG(angle);

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

    // And second transform was inverted angle
    const pushModifier = stateClone2.pushModifier as jest.Mock;
    const pushedMod = pushModifier.mock.calls[0][0] as InvertTransformModifier;
    pushedMod.modifyFireData(createFiringState(), fd);
    const [_, mirroredAngle, __] = decomposeTransform(fd.transform);
    expect(mirroredAngle).toBeCloseTo(-angle);
  });

  test("can invert translation x", (): void => {
    // Given FiringState
    const stateClone1 = createFiringState();
    const stateClone2 = createFiringState();
    const state = createFiringState(stateClone1, stateClone2);

    // And FireData
    const translationX = 13;
    const fd = simpleMock<IFireData>();
    fd.transform = mat.translate(translationX, 0);

    // And Alternate with child gun and specify invert translation x
    const childGun = createGunMockConsumeFrames(0);
    const alternate = new Alternate({ mirrorTranslationX: true }, childGun);

    // When play Alternate
    const progress = alternate.play(state);
    while (true) {
      const r = progress.next();
      if (r.done) break;
    }

    // Then child gun played twice
    expect(childGun.play).toBeCalledWith(stateClone1);
    expect(childGun.play).toBeCalledWith(stateClone2);

    // And second transform was inverted translation x
    const pushModifier = stateClone2.pushModifier as jest.Mock;
    const pushedMod = pushModifier.mock.calls[0][0] as InvertTransformModifier;
    pushedMod.modifyFireData(createFiringState(), fd);
    const [mirroredTrans, _, __] = decomposeTransform(fd.transform);
    expect(mirroredTrans.x).toBeCloseTo(-translationX);
  });

  test("can invert translation y", (): void => {
    // Given FiringState
    const stateClone1 = createFiringState();
    const stateClone2 = createFiringState();
    const state = createFiringState(stateClone1, stateClone2);

    // And FireData
    const translationY = 13;
    const fd = simpleMock<IFireData>();
    fd.transform = mat.translate(0, translationY);

    // And Alternate with child gun and specify invert translation y
    const childGun = createGunMockConsumeFrames(0);
    const alternate = new Alternate({ mirrorTranslationY: true }, childGun);

    // When play Alternate
    const progress = alternate.play(state);
    while (true) {
      const r = progress.next();
      if (r.done) break;
    }

    // Then child gun played twice
    expect(childGun.play).toBeCalledWith(stateClone1);
    expect(childGun.play).toBeCalledWith(stateClone2);

    // And second transform was inverted translation x
    const pushModifier = stateClone2.pushModifier as jest.Mock;
    const pushedMod = pushModifier.mock.calls[0][0] as InvertTransformModifier;
    pushedMod.modifyFireData(createFiringState(), fd);
    const [mirroredTrans, _, __] = decomposeTransform(fd.transform);
    expect(mirroredTrans.y).toBeCloseTo(-translationY);
  });
});
