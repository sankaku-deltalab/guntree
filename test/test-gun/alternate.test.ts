import * as mat from "transformation-matrix";

import { FiringState } from "guntree/firing-state";
import { Alternate } from "guntree/elements/gun";
import { decomposeTransform } from "guntree/transform-util";
import { FireData } from "guntree/fire-data";
import { Owner } from "guntree/owner";
import { Player } from "guntree/player";
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

describe("#Alternate", (): void => {
  test("play child gun and inverted child gun as parallel", (): void => {
    // Given FiringState
    const stateClone1 = createFiringState();
    const stateClone2 = createFiringState();
    const state = createFiringState(stateClone1, stateClone2);

    // And Alternate with child gun
    const childGun = createGunMockConsumeFrames(0);
    const alternate = new Alternate({}, childGun);

    // When play Alternate
    const owner = simpleMock<Owner>();
    const player = simpleMock<Player>();
    const progress = alternate.play(owner, simpleMock(), state);
    while (true) {
      const r = progress.next();
      if (r.done) break;
    }

    // Then child gun played twice
    expect(childGun.play).toBeCalledWith(owner, player, stateClone1);
    expect(childGun.play).toBeCalledWith(owner, player, stateClone2);
  });

  test("invert angle in second firing", (): void => {
    // Given FiringState
    const originalAngle = 30;
    const state = new FiringState();

    // And Alternate with fire gun
    const angles: number[] = [];
    const fire = createGunMockWithCallback((_owner, _player, state) => {
      const fd = new FireData();
      fd.transform = mat.rotateDEG(originalAngle);
      state.modifyFireData(fd);
      const [_pos, rot, _scale] = decomposeTransform(fd.transform);
      angles.push(rot);
    });
    const alternate = new Alternate({}, fire);

    // When play Alternate
    alternate.play(simpleMock(), simpleMock(), state).next();

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

    // And Alternate gun
    const angles: number[] = [];
    const fire = createGunMockWithCallback((_owner, _player, state) => {
      const fd = new FireData();
      state.modifyFireData(fd);
      const [_pos, rot, _scale] = decomposeTransform(fd.transform);
      angles.push(rot);
    });
    const alternate = new Alternate({ invertedMuzzleName: muzzle2 }, fire);

    // When play Alternate
    const state = new FiringState();
    alternate.play(owner, simpleMock(), state).next();

    // Then seconds firing used another muzzle
    expect(angles[0]).toBeCloseTo(0);
    expect(angles[1]).toBeCloseTo(muzzleAngle2);
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
    const progress = alternate.play(simpleMock(), simpleMock(), state);
    while (true) {
      const r = progress.next();
      if (r.done) break;
      consumedFrames += 1;
    }

    // Then consume frames equal to double of child frames
    expect(consumedFrames).toBe(childFrames * 2);
  });

  test("can invert translation y", (): void => {
    // Given FiringState
    const originalTranslateY = 30;
    const state = new FiringState();

    // And Alternate with fire gun
    const transY: number[] = [];
    const fire = createGunMockWithCallback((_owner, _player, state) => {
      const fd = new FireData();
      fd.transform = mat.translate(0, originalTranslateY);
      state.modifyFireData(fd);
      const [pos, _rot, _scale] = decomposeTransform(fd.transform);
      transY.push(pos.y);
    });
    const alternate = new Alternate({ mirrorTranslationY: true }, fire);

    // When play Alternate
    alternate.play(simpleMock(), simpleMock(), state).next();

    // Then seconds firing translation Y was inverted
    expect(transY[0]).toBeCloseTo(originalTranslateY);
    expect(transY[1]).toBeCloseTo(-originalTranslateY);
  });
});
