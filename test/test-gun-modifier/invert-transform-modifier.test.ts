import * as mat from "transformation-matrix";

import { FiringState } from "guntree/firing-state";
import { FireData } from "guntree/fire-data";
import { InvertTransformModifier } from "guntree/elements/gunModifier";
import { decomposeTransform } from "guntree/transform-util";

describe("#InvertTransformModifier", (): void => {
  test("can invert angle", (): void => {
    // Given FiringState
    const state = new FiringState();

    // And InvertTransformModifier with angle inverting option
    const initialAngle = 13;
    const invertMod = new InvertTransformModifier({ angle: true });

    // When modify InvertTransformModifier
    const fd = new FireData();
    fd.transform = mat.rotateDEG(initialAngle);
    invertMod.createModifier(state)(fd);

    // Then modified transform was inverted angle
    const [_, modifiedAngle, __] = decomposeTransform(fd.transform);
    expect(modifiedAngle).toBeCloseTo(-initialAngle);
  });

  test("can invert translation y", (): void => {
    // Given FiringState
    const state = new FiringState();

    // And InvertTransformModifier with translation y inverting option
    const initialTransY = 13;
    const invertMod = new InvertTransformModifier({ translationY: true });

    // When modify InvertTransformModifier
    const fd = new FireData();
    fd.transform = mat.translate(0, initialTransY);
    invertMod.createModifier(state)(fd);

    // Then modified transform was inverted translation Y
    const [modifiedTrans, _, __] = decomposeTransform(fd.transform);
    expect(modifiedTrans.y).toBeCloseTo(-initialTransY);
  });
});
