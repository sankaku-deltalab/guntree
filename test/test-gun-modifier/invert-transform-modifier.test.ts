import * as mat from "transformation-matrix";

import { FiringState } from "guntree/firing-state";
import { FireData } from "guntree/fire-data";
import { InvertTransformModifier } from "guntree/elements/gunModifier";
import { decomposeTransform } from "guntree/transform-util";

describe("#InvertTransformModifier", (): void => {
  test("invert angle, translation y, scale y", (): void => {
    // Given FiringState
    const state = new FiringState();

    // And InvertTransformModifier
    const initialAngle = 13;
    const initialTransY = 13;
    const invertMod = new InvertTransformModifier();

    // When modify InvertTransformModifier
    const fd = new FireData();
    fd.transform = mat.transform(
      mat.translate(0, initialTransY),
      mat.rotateDEG(initialAngle)
    );
    invertMod.createModifier(state)(fd);

    // Then modified transform was inverted
    const [modifiedPos, modifiedAngle, _] = decomposeTransform(fd.transform);
    expect(modifiedPos.y).toBeCloseTo(-initialTransY);
    expect(modifiedAngle).toBeCloseTo(-initialAngle);
  });
});
