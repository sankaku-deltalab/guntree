import { RepeatState } from "guntree/repeating-manager";
import { Iterate } from "guntree/elements/lazy-evaluative";
import { createLazyEvaluativeMockReturnOnce } from "../util";
import {
  createRepeatStateManagerWithGet,
  createFiringStateWithRSM
} from "./util";

describe("#Iterate", (): void => {
  test.each`
    input           | finished | expected
    ${[10, 20, 30]} | ${0}     | ${10}
    ${[10, 20, 30]} | ${1}     | ${20}
    ${[10, 20, 30]} | ${2}     | ${30}
  `(
    "deal $expected when finished repeating is $finished and input is $input",
    ({ input, finished, expected }): void => {
      // Given repeating progress
      const rsm = createRepeatStateManagerWithGet(
        jest.fn().mockReturnValueOnce({ finished, total: 3 })
      );
      const state = createFiringStateWithRSM(rsm);

      // When eval iterate
      const iterate = new Iterate(input);
      const actual = iterate.calc(state);

      // Then deal expected
      expect(actual).toBeCloseTo(expected);
    }
  );

  test("deal default value when finished repeating is out of input", (): void => {
    // Given repeating progress
    const rsm = createRepeatStateManagerWithGet(
      jest.fn().mockReturnValueOnce({ finished: 2, total: 3 })
    );
    const state = createFiringStateWithRSM(rsm);

    // When eval iterate with one length input and default
    const input = [0];
    const defaultValue = 2;
    const iterate = new Iterate(input, { default: defaultValue });
    const actual = iterate.calc(state);

    // Then deal default
    expect(actual).toBeCloseTo(defaultValue);
  });

  test("throw error if default is not in option and finished repeating is out of input", (): void => {
    // Given repeating progress
    const rsm = createRepeatStateManagerWithGet(
      jest.fn().mockReturnValueOnce({ finished: 2, total: 3 })
    );
    const state = createFiringStateWithRSM(rsm);

    // When eval iterate with one length input without default
    for (const option of [undefined, {}]) {
      const input = [0];
      const iterate = new Iterate(input, option);

      // Then throw error
      expect((): number => iterate.calc(state)).toThrowError();
    }
  });

  test("use previous repeating if not specified target", (): void => {
    // Given repeating progress
    const rsm = createRepeatStateManagerWithGet(
      jest.fn().mockReturnValueOnce({ finished: 3, total: 4 })
    );
    const state = createFiringStateWithRSM(rsm);

    // When eval iterate without target
    const input = [0, 1, 2, 3];
    const iterate = new Iterate(input);
    const actual = iterate.calc(state);

    // Then use previous repeating
    expect(actual).toBeCloseTo(3);
  });

  test("use repeating specified by target with string", (): void => {
    const pairs: [string, number][] = [
      ["a", 0],
      ["b", 1]
    ];
    for (const [target, finished] of pairs) {
      // Given repeating progress
      const rsm = createRepeatStateManagerWithGet(
        jest.fn().mockImplementation(
          (name: string): RepeatState => {
            if (name === target) return { finished, total: 4 };
            if (name === "c") return { finished: 2, total: 4 };
            return { finished: 3, total: 4 };
          }
        )
      );
      const state = createFiringStateWithRSM(rsm);

      // When eval iterate with target
      const input = [0, 1, 2, 3];
      const iterate = new Iterate(input, { target });
      const actual = iterate.calc(state);

      // Then use specified repeating
      expect(actual).toBeCloseTo(input[finished]);
    }
  });

  test("can use lazyEvaluative in array", (): void => {
    // Given repeating progress
    const rsm = createRepeatStateManagerWithGet(
      jest.fn().mockReturnValueOnce({ finished: 0, total: 3 })
    );
    const state = createFiringStateWithRSM(rsm);

    // And lazyEvaluative
    const value = 1323;
    const le = createLazyEvaluativeMockReturnOnce(value);

    // When eval iterate with one length input and default
    const input = [le];
    const iterate = new Iterate(input);
    const actual = iterate.calc(state);

    // Then deal default
    expect(actual).toBeCloseTo(value);
  });
});
