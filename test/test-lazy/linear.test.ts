import { RepeatState } from "guntree/firing-state";
import { Linear } from "guntree/elements/lazyEvaluative";
import {
  createRepeatStateManagerWithGet,
  createFiringStateWithRSM
} from "./util";
import { createLazyEvaluativeMockReturnOnce } from "../util";

describe("#Linear", (): void => {
  test.each([
    [0, 1, 10],
    [0, 2, 10],
    [1, 2, 15],
    [1, 4, 12.5]
  ])(
    "deal linear value with respect to repeating progress (%i, %i)",
    async (finished, total, expected): Promise<void> => {
      // Given repeating progress
      const [start, stop] = [10, 20];
      const rsm = createRepeatStateManagerWithGet(
        jest.fn().mockReturnValueOnce({ finished, total })
      );
      const state = createFiringStateWithRSM(rsm);

      // When eval Linear with (start, stop)
      const linear = new Linear(start, stop);
      const actual = linear.calc(state);

      // Then deal expected
      expect(actual).toBeCloseTo(expected);
    }
  );

  test.each`
    start | stop  | finished | total | expected
    ${0}  | ${1}  | ${0}     | ${1}  | ${0}
    ${0}  | ${1}  | ${0}     | ${2}  | ${0}
    ${0}  | ${1}  | ${1}     | ${2}  | ${0.5}
    ${10} | ${30} | ${1}     | ${4}  | ${15}
  `(
    "can use LazyEvaluative to start and stop",
    async ({ start, stop, finished, total, expected }): Promise<void> => {
      // Given repeating progress
      const rsm = createRepeatStateManagerWithGet(
        jest.fn().mockReturnValueOnce({ finished, total })
      );
      const state = createFiringStateWithRSM(rsm);

      // When eval Linear with (start, stop)
      const linear = new Linear(
        createLazyEvaluativeMockReturnOnce(start),
        createLazyEvaluativeMockReturnOnce(stop)
      );
      const actual = linear.calc(state);

      // Then deal expected
      expect(actual).toBeCloseTo(expected);
    }
  );

  test.each`
    target | expected
    ${"a"} | ${0}
    ${"b"} | ${10}
  `(
    "use specified repeating progress with string ($target)",
    async ({ target, expected }): Promise<void> => {
      // Given repeating progress
      const [start, stop] = [0, 40];
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

      // When eval Linear with name
      const linear = new Linear(start, stop, target);
      const actual = linear.calc(state);

      // Then deal expected
      expect(actual).toBeCloseTo(expected);
    }
  );

  test("use previous repeating progress if not specified target", (): void => {
    // Given repeating progress
    const [start, stop] = [0, 40];
    const rsm = createRepeatStateManagerWithGet(
      jest.fn().mockImplementation(
        (name?: string): RepeatState => {
          if (name === undefined) return { finished: 0, total: 4 };
          throw new Error();
        }
      )
    );
    const state = createFiringStateWithRSM(rsm);

    // When eval Linear with name
    const linear = new Linear(start, stop);
    const actual = linear.calc(state);

    // Then deal expected
    expect(actual).toBeCloseTo(0);
  });
});
