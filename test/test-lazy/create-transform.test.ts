import * as mat from "transformation-matrix";

import { FiringState } from "guntree/firing-state";
import { CreateTransform } from "guntree/elements/lazyEvaluative";
import { simpleMock, createLazyEvaluativeMockReturnOnce } from "../util";

const matKeys: ["a", "b", "c", "d", "e", "f"] = ["a", "b", "c", "d", "e", "f"];

describe("#CreateTransform", (): void => {
  test.each`
    translation
    ${-1}
    ${0}
    ${0.5}
    ${1}
    ${1.2}
  `(
    "can use translation with single value",
    ({ translation }): void => {
      // Given repeating progress
      const state = simpleMock<FiringState>();

      // And CreateTransform with translation
      const createTrans = new CreateTransform({ translation });

      // When eval CreateTransform
      const actual = createTrans.calc(state);

      // Then translated matrix was dealt
      const expected = mat.translate(translation);
      for (const key of matKeys) {
        expect(actual[key]).toBeCloseTo(expected[key]);
      }
    }
  );

  test.each`
    translation
    ${-1}
    ${0}
    ${0.5}
    ${1}
    ${1.2}
  `(
    "can use translation with single lazyEvaluative value",
    ({ translation }): void => {
      // Given repeating progress
      const state = simpleMock<FiringState>();

      // And translation as lazyEvaluative
      const translationLe = createLazyEvaluativeMockReturnOnce(translation);

      // And CreateTransform with translation
      const createTrans = new CreateTransform({ translation: translationLe });

      // When eval CreateTransform
      const actual = createTrans.calc(state);

      // Then translated matrix was dealt
      const expected = mat.translate(translation);
      for (const key of matKeys) {
        expect(actual[key]).toBeCloseTo(expected[key]);
      }
    }
  );

  test.each`
    tx     | ty
    ${-1}  | ${0}
    ${0}   | ${8}
    ${0.5} | ${10}
  `(
    "can use translation with double value",
    ({ tx, ty }): void => {
      // Given repeating progress
      const state = simpleMock<FiringState>();

      // And CreateTransform with translation
      const createTrans = new CreateTransform({ translation: [tx, ty] });

      // When eval CreateTransform
      const actual = createTrans.calc(state);

      // Then translated matrix was dealt
      const expected = mat.translate(tx, ty);
      for (const key of matKeys) {
        expect(actual[key]).toBeCloseTo(expected[key]);
      }
    }
  );

  test.each`
    tx     | ty
    ${-1}  | ${0}
    ${0}   | ${8}
    ${0.5} | ${10}
  `(
    "can use translation with double lazyEvaluative values",
    ({ tx, ty }): void => {
      // Given repeating progress
      const state = simpleMock<FiringState>();

      // And translation as lazyEvaluative
      const txLe = createLazyEvaluativeMockReturnOnce(tx);
      const tyLe = createLazyEvaluativeMockReturnOnce(ty);

      // And CreateTransform with translation
      const createTrans = new CreateTransform({ translation: [txLe, tyLe] });

      // When eval CreateTransform
      const actual = createTrans.calc(state);

      // Then translated matrix was dealt
      const expected = mat.translate(tx, ty);
      for (const key of matKeys) {
        expect(actual[key]).toBeCloseTo(expected[key]);
      }
    }
  );

  test.each`
    rotationDeg
    ${0}
    ${30}
    ${90}
    ${-45}
    ${720}
  `(
    "can use rotate as degrees",
    ({ rotationDeg }): void => {
      // Given repeating progress
      const state = simpleMock<FiringState>();

      // And CreateTransform with angleDeg
      const createTrans = new CreateTransform({ rotationDeg });

      // When eval CreateTransform
      const actual = createTrans.calc(state);

      // Then rotated matrix was dealt
      const expected = mat.rotateDEG(rotationDeg);
      for (const key of matKeys) {
        expect(actual[key]).toBeCloseTo(expected[key]);
      }
    }
  );

  test.each`
    rotationDeg
    ${0}
    ${30}
    ${90}
    ${-45}
    ${720}
  `(
    "can use rotate as degrees with lazyEvaluative number",
    ({ rotationDeg }): void => {
      // Given repeating progress
      const state = simpleMock<FiringState>();

      // And angle as lazyEvaluative
      const leRot = createLazyEvaluativeMockReturnOnce(rotationDeg);

      // And CreateTransform with angleDeg
      const createTrans = new CreateTransform({ rotationDeg: leRot });

      // When eval CreateTransform
      const actual = createTrans.calc(state);

      // Then rotated matrix was dealt
      const expected = mat.rotateDEG(rotationDeg);
      for (const key of matKeys) {
        expect(actual[key]).toBeCloseTo(expected[key]);
      }
    }
  );
  test.each`
    scale
    ${-1}
    ${0}
    ${0.5}
    ${1}
    ${1.2}
  `(
    "can use scale with single value",
    ({ scale }): void => {
      // Given repeating progress
      const state = simpleMock<FiringState>();

      // And CreateTransform with scale
      const createTrans = new CreateTransform({ scale });

      // When eval CreateTransform
      const actual = createTrans.calc(state);

      // Then scale matrix was dealt
      const expected = mat.scale(scale);
      for (const key of matKeys) {
        expect(actual[key]).toBeCloseTo(expected[key]);
      }
    }
  );

  test.each`
    scale
    ${-1}
    ${0}
    ${0.5}
    ${1}
    ${1.2}
  `(
    "can use scale with single lazyEvaluative value",
    ({ scale }): void => {
      // Given repeating progress
      const state = simpleMock<FiringState>();

      // And scale as lazyEvaluative
      const scaleLe = createLazyEvaluativeMockReturnOnce(scale);

      // And CreateTransform with scale
      const createTrans = new CreateTransform({ scale: scaleLe });

      // When eval CreateTransform
      const actual = createTrans.calc(state);

      // Then scale matrix was dealt
      const expected = mat.scale(scale);
      for (const key of matKeys) {
        expect(actual[key]).toBeCloseTo(expected[key]);
      }
    }
  );

  test.each`
    sx     | sy
    ${-1}  | ${0}
    ${0}   | ${8}
    ${0.5} | ${10}
  `(
    "can use scale with double value",
    ({ sx, sy }): void => {
      // Given repeating progress
      const state = simpleMock<FiringState>();

      // And CreateTransform with scale
      const createTrans = new CreateTransform({ scale: [sx, sy] });

      // When eval CreateTransform
      const actual = createTrans.calc(state);

      // Then rotated matrix was dealt
      const expected = mat.scale(sx, sy);
      for (const key of matKeys) {
        expect(actual[key]).toBeCloseTo(expected[key]);
      }
    }
  );

  test.each`
    sx     | sy
    ${-1}  | ${0}
    ${0}   | ${8}
    ${0.5} | ${10}
  `(
    "can use scale with single lazyEvaluative value",
    ({ sx, sy }): void => {
      // Given repeating progress
      const state = simpleMock<FiringState>();

      // And scale as lazyEvaluative
      const sxLe = createLazyEvaluativeMockReturnOnce(sx);
      const syLe = createLazyEvaluativeMockReturnOnce(sy);

      // And CreateTransform with scale
      const createTrans = new CreateTransform({ scale: [sxLe, syLe] });

      // When eval CreateTransform
      const actual = createTrans.calc(state);

      // Then rotated matrix was dealt
      const expected = mat.scale(sx, sy);
      for (const key of matKeys) {
        expect(actual[key]).toBeCloseTo(expected[key]);
      }
    }
  );
});
