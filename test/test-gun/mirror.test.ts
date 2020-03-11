import * as mat from "transformation-matrix";

import { FiringState } from "guntree/firing-state";
import { Mirror } from "guntree/elements/gun";
import { decomposeTransform } from "guntree/transform-util";
import { FireData } from "guntree/fire-data";
import { Owner } from "guntree/owner";
import {
  simpleMock,
  createGunMockConsumeFrames,
  createFiringStateMock,
  createGunMockWithCallback
} from "../util";

const createFiringState = (...clones: FiringState[]): FiringState => {
  const state = createFiringStateMock(...clones);
  state.pushModifier = jest.fn();
  return state;
};

describe("#Mirror", (): void => {
  test("play child gun and inverted child gun as parallel", (): void => {
    // Given FiringState
    const stateClone1 = createFiringState();
    const stateClone2 = createFiringState();
    const state = createFiringState(stateClone1, stateClone2);

    // And Mirror with child gun
    const childGun = createGunMockConsumeFrames(0);
    const mirror = new Mirror({}, childGun);

    // When play Mirror
    const owner = simpleMock<Owner>();
    const progress = mirror.play(owner, state);
    while (true) {
      const r = progress.next();
      if (r.done) break;
    }

    // Then child gun played twice
    expect(childGun.play).toBeCalledWith(owner, stateClone1);
    expect(childGun.play).toBeCalledWith(owner, stateClone2);
  });

  test("invert angle in second firing", (): void => {
    // Given FiringState
    const originalAngle = 30;
    const state = new FiringState();

    // And Mirror with fire gun
    const angles: number[] = [];
    const fire = createGunMockWithCallback((_owner, state) => {
      const fd = new FireData();
      fd.transform = mat.rotateDEG(originalAngle);
      state.modifyFireData(fd);
      const [_pos, rot, _scale] = decomposeTransform(fd.transform);
      angles.push(rot);
    });
    const mirror = new Mirror({}, fire);

    // When play Mirror
    mirror.play(simpleMock(), state).next();

    // Then seconds firing angle was inverted
    expect(angles[0]).toBeCloseTo(originalAngle);
    expect(angles[1]).toBeCloseTo(-originalAngle);
  });

  test("can specify another muzzle for inverted firing", (): void => {
    // Given owner
    const muzzle2 = "m2";
    const muzzleAngle2 = 45;
    const owner = simpleMock<Owner>();
    owner.getMuzzleTransform = jest.fn().mockImplementation((name: string) => {
      if (name === muzzle2) return mat.rotateDEG(muzzleAngle2);
      throw new Error();
    });

    // And Mirror gun
    const angles: number[] = [];
    const fire = createGunMockWithCallback((_owner, state) => {
      const fd = new FireData();
      state.modifyFireData(fd);
      const [_pos, rot, _scale] = decomposeTransform(fd.transform);
      angles.push(rot);
    });
    const mirror = new Mirror({ invertedMuzzleName: muzzle2 }, fire);

    // When play Mirror
    const state = new FiringState();
    mirror.play(owner, state).next();

    // Then seconds firing used another muzzle
    expect(angles[0]).toBeCloseTo(0);
    expect(angles[1]).toBeCloseTo(muzzleAngle2);
  });

  test("consume frames equal to child frames", (): void => {
    // Given FiringState
    const stateClone1 = createFiringState();
    const stateClone2 = createFiringState();
    const state = createFiringState(stateClone1, stateClone2);

    // And Mirror with child gun
    const childFrames = 6;
    const childGun = createGunMockConsumeFrames(childFrames);
    const mirror = new Mirror({}, childGun);

    // When play Mirror
    let consumedFrames = 0;
    const progress = mirror.play(simpleMock(), state);
    while (true) {
      const r = progress.next();
      if (r.done) break;
      consumedFrames += 1;
    }

    // Then consume frames equal to child frames
    expect(consumedFrames).toBe(childFrames);
  });

  test("can invert translation y", (): void => {
    // Given FiringState
    const originalTranslateY = 30;
    const state = new FiringState();

    // And Mirror with fire gun
    const transY: number[] = [];
    const fire = createGunMockWithCallback((_owner, state) => {
      const fd = new FireData();
      fd.transform = mat.translate(0, originalTranslateY);
      state.modifyFireData(fd);
      const [pos, _rot, _scale] = decomposeTransform(fd.transform);
      transY.push(pos.y);
    });
    const mirror = new Mirror({ mirrorTranslationY: true }, fire);

    // When play Mirror
    mirror.play(simpleMock(), state).next();

    // Then seconds firing translation Y was inverted
    expect(transY[0]).toBeCloseTo(originalTranslateY);
    expect(transY[1]).toBeCloseTo(-originalTranslateY);
  });
});
