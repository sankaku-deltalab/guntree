import { Round } from "guntree/elements/lazy-evaluative";
import {
  createFiringStateMock,
  createLazyEvaluativeMockReturnOnce
} from "../util";

describe("#Round", (): void => {
  test.each`
    input   | expected
    ${0.49} | ${0}
    ${0.5}  | ${1}
    ${1}    | ${1}
    ${1.49} | ${1}
    ${1.5}  | ${2}
  `(
    "deal $expected when input is number of $input",
    ({ input, expected }): void => {
      // Given repeating progress
      const state = createFiringStateMock();

      // When eval round
      const round = new Round(input);
      const actual = round.calc(state);

      // Then deal rounded value
      expect(actual).toBeCloseTo(expected);
    }
  );

  test.each`
    input   | expected
    ${0.49} | ${0}
    ${0.5}  | ${1}
    ${1}    | ${1}
    ${1.49} | ${1}
    ${1.5}  | ${2}
  `(
    "deal $expected when input is lazyEvaluative deals $input",
    ({ input, expected }): void => {
      // Given repeating progress
      const state = createFiringStateMock();

      // When eval round with lazyEvaluative
      const round = new Round(createLazyEvaluativeMockReturnOnce(input));
      const actual = round.calc(state);

      // Then deal rounded value dealt from lazyEvaluative
      expect(actual).toBeCloseTo(expected);
    }
  );
});
