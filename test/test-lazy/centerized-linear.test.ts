import { RepeatState } from "guntree/firing-state";
import { CenterizedLinear } from "guntree/elements/lazyEvaluative";
import { createLazyEvaluativeMockReturnOnce } from "../util";
import {
  createRepeatStateManagerWithGet,
  createFiringStateWithRSM
} from "./util";

describe("#CenterizedLinear", (): void => {
  test.each`
    range  | finished | total | expected
    ${10}  | ${0}     | ${1}  | ${0}
    ${15}  | ${0}     | ${3}  | ${-5}
    ${15}  | ${1}     | ${3}  | ${0}
    ${15}  | ${2}     | ${3}  | ${5}
    ${360} | ${0}     | ${4}  | ${-135}
    ${360} | ${1}     | ${4}  | ${-45}
    ${360} | ${2}     | ${4}  | ${45}
    ${360} | ${3}     | ${4}  | ${135}
  `(
    "deal centerized linear value",
    ({ range, finished, total, expected }): void => {
      // Given repeating progress
      const rsm = createRepeatStateManagerWithGet(
        jest.fn().mockReturnValueOnce({ finished, total })
      );
      const state = createFiringStateWithRSM(rsm);

      // When eval CenterizedLinear
      const cl = new CenterizedLinear(range);
      const actual = cl.calc(state);

      // Then deal expected
      expect(actual).toBeCloseTo(expected);
    }
  );

  test.each`
    target | expected
    ${"a"} | ${-15}
    ${"b"} | ${-5}
  `(
    "use specified repeating progress with string",
    ({ target, expected }): void => {
      // Given repeating progress
      const range = 40;
      const rsm = createRepeatStateManagerWithGet(
        jest.fn().mockImplementation(
          (name: string): RepeatState => {
            if (name === "a") return { finished: 0, total: 4 };
            if (name === "b") return { finished: 1, total: 4 };
            return { finished: 3, total: 4 };
          }
        )
      );
      const state = createFiringStateWithRSM(rsm);

      // When eval CenterizedLinear with name
      const cl = new CenterizedLinear(range, target);
      const actual = cl.calc(state);

      // Then deal expected
      expect(actual).toBeCloseTo(expected);
    }
  );

  test("use previous repeating progress if not specified target", (): void => {
    // Given repeating progress
    const range = 40;
    const rsm = createRepeatStateManagerWithGet(
      jest.fn().mockReturnValueOnce({ finished: 0, total: 4 })
    );
    const state = createFiringStateWithRSM(rsm);

    // When eval CenterizedLinear without target
    const cl = new CenterizedLinear(range);
    const actual = cl.calc(state);

    // Then deal expected
    expect(actual).toBeCloseTo(-15);
  });

  test("use lazyEvaluative totalRange", (): void => {
    // Given repeating progress
    const rsm = createRepeatStateManagerWithGet(
      jest.fn().mockReturnValueOnce({ finished: 0, total: 4 })
    );
    const state = createFiringStateWithRSM(rsm);

    // And lazyEvaluative
    const range = 40;
    const le = createLazyEvaluativeMockReturnOnce(range);

    // When eval CenterizedLinear without target
    const cl = new CenterizedLinear(le);
    const actual = cl.calc(state);

    // Then deal expected
    expect(actual).toBeCloseTo(-15);
  });
});
