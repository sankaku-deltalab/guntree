import * as mat from "transformation-matrix";

import { FiringState, FireData } from "guntree/firing-state";
import { InvertTransformModifier } from "guntree/elements/gunModifier";
import { simpleMock } from "../util";
import { decomposeTransform } from "guntree/transform-util";

const createFireData = (trans: mat.Matrix): FireData => {
  const fd = simpleMock<FireData>();
  fd.transform = trans;
  return fd;
};

describe("#InvertTransformModifier", (): void => {
  test("can invert angle", (): void => {
    // Given FiringState
    const state = simpleMock<FiringState>();

    // And FireData with transform
    const initialAngle = 13;
    const fd = createFireData(mat.rotateDEG(initialAngle));

    // And InvertTransformModifier with angle inverting option
    const invertMod = new InvertTransformModifier({ angle: true });

    // When modify InvertTransformModifier
    invertMod.modifyFireData(state, fd);

    // Then modified transform was inverted angle
    const [_, modifiedAngle, __] = decomposeTransform(fd.transform);
    expect(modifiedAngle).toBeCloseTo(-initialAngle);
  });

  test("can invert translation x", (): void => {
    // Given FiringState
    const state = simpleMock<FiringState>();

    // And FireData with transform
    const initialTransX = 13;
    const fd = createFireData(mat.translate(initialTransX, 0));
    const oldTrans = fd.transform;

    // And InvertTransformModifier with translation x inverting option
    const invertMod = new InvertTransformModifier({ translationX: true });

    // When modify InvertTransformModifier
    invertMod.modifyFireData(state, fd);

    // Then modified transform was inverted angle
    expect(fd.transform).not.toBe(oldTrans);
    const [modifiedTrans, _, __] = decomposeTransform(fd.transform);
    expect(modifiedTrans.x).toBeCloseTo(-initialTransX);
  });

  test("can invert translation y", (): void => {
    // Given FiringState
    const state = simpleMock<FiringState>();

    // And FireData with transform
    const initialTransY = 13;
    const fd = createFireData(mat.translate(0, initialTransY));
    const oldTrans = fd.transform;

    // And InvertTransformModifier with translation y inverting option
    const invertMod = new InvertTransformModifier({ translationY: true });

    // When modify InvertTransformModifier
    invertMod.modifyFireData(state, fd);

    // Then modified transform was inverted angle
    expect(fd.transform).not.toBe(oldTrans);
    const [modifiedTrans, _, __] = decomposeTransform(fd.transform);
    expect(modifiedTrans.y).toBeCloseTo(-initialTransY);
  });
});
