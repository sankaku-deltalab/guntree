import * as mat from "transformation-matrix";

import { FiringState } from "guntree/firing-state";
import { FireData } from "guntree/fire-data";
import { TransformModifier } from "guntree/elements";
import { simpleMock, createLazyEvaluativeMockReturnOnce } from "../util";

const createFireData = (trans: mat.Matrix): FireData => {
  const fd = simpleMock<FireData>();
  fd.transform = trans;
  return fd;
};

describe("#TransformModifier", (): void => {
  test("generate modifier transform fireData", (): void => {
    // Given FiringState
    const state = simpleMock<FiringState>();

    // And FireData
    const initialTrans = mat.translate(1.125);
    const fd = createFireData(initialTrans);

    // And Transform
    const trans = mat.translate(5);
    const transformMod = new TransformModifier(trans);

    // When modify FireData
    transformMod.createModifier(state)(fd);

    // Then transform in fireData was transformed
    const expectedTrans = mat.transform(initialTrans, trans);
    expect(fd.transform).toEqual(expectedTrans);
  });

  test("can use lazyEvaluative transform", (): void => {
    // Given FiringState
    const state = simpleMock<FiringState>();

    // And FireData
    const initialTrans = mat.translate(1.125);
    const fd = createFireData(initialTrans);

    // And Transform
    const transConst = mat.translate(5);
    const transLe = createLazyEvaluativeMockReturnOnce(transConst);
    const transformMod = new TransformModifier(transLe);

    // When modify FireData
    transformMod.createModifier(state)(fd);

    // Then transform in fireData was transformed
    const expectedTrans = mat.transform(initialTrans, transConst);
    expect(fd.transform).toEqual(expectedTrans);
  });
});
