import { range } from 'lodash';

import { IFiringState } from 'guntree/gun';
import { Iterate } from 'guntree/lazy-evaluative';

/**
  * - 順番に値を出力する
  * - 入力が足りない場合、デフォルト値を使う
  * - 入力が足りず、デフォルト値がない場合、例外を投げる
  * - 連射順が指定されていて、その連射があるならそれを使う
  * - 連射名が指定されていて、その連射があるならそれを使う
  * - 連射名が指定されていない場合、現在の連射を使う
 */
describe.only('#Iterate', () => {
    test.each`
    input           | finished | expected
    ${[10, 20, 30]} | ${0}     | ${10}
    ${[10, 20, 30]} | ${1}     | ${20}
    ${[10, 20, 30]} | ${2}     | ${30}
    `('deal $expected when finished repeating is $finished and input is $input', ({ input, finished, expected }) => {
        // Given repeating progress
        const stateClass = jest.fn<IFiringState>(() => ({
            getRepeatState: jest.fn().mockReturnValueOnce({ finished, total: 3 }),
        }));
        const state = new stateClass();

        // When eval iterate
        const iterate = new Iterate(input);
        const actual = iterate.calc(state);

        // Then deal expected
        expect(actual).toBeCloseTo(expected);
    });

    test('deal default value when finished repeating is out of input', () => {
        // Given repeating progress
        const stateClass = jest.fn<IFiringState>(() => ({
            getRepeatState: jest.fn().mockReturnValueOnce({ finished: 2, total: 3 }),
        }));
        const state = new stateClass();

        // When eval iterate with one length input and default
        const input = [0];
        const defaultValue = 2;
        const iterate = new Iterate(input, { default: defaultValue });
        const actual = iterate.calc(state);

        // Then deal default
        expect(actual).toBeCloseTo(defaultValue);
    });

    test('throw error if default is not in option and finished repeating is out of input', () => {
        // Given repeating progress
        const stateClass = jest.fn<IFiringState>(() => ({
            getRepeatState: jest.fn().mockReturnValueOnce({ finished: 2, total: 3 }),
        }));
        const state = new stateClass();

        // When eval iterate with one length input without default
        for (const option of [undefined, {}]) {
            const input = [0];
            const iterate = new Iterate(input, option);

            // Then throw error
            expect(() => iterate.calc(state)).toThrowError();
        }
    });

    test('use previous repeating if not specified target', () => {
        for (const idx of range(4)) {
            // Given repeating progress
            const stateClass = jest.fn<IFiringState>(() => ({
                getRepeatState: jest.fn().mockImplementation((position: number) => {
                    if (position === 0) return { finished: idx, total: 4 };
                    return { finished: 3, total: 4 };
                }),
            }));
            const state = new stateClass();

            // When eval iterate without target
            const input = [0, 1, 2, 3];
            const iterate = new Iterate(input);
            const actual = iterate.calc(state);

            // Then use previous repeating
            expect(actual).toBeCloseTo(input[idx]);
        }
    });

    test('use repeating specified by target with string', () => {
        const pairs: [string, number][] = [['a', 0], ['b', 1]];
        for (const [target, finished] of pairs) {
            // Given repeating progress
            const stateClass = jest.fn<IFiringState>(() => ({
                getRepeatStateByName: jest.fn().mockImplementation((name: string) => {
                    if (name === target) return { finished, total: 4 };
                    if (name === 'c') return { finished: 2, total: 4 };
                    return { finished: 3, total: 4 };
                }),
            }));
            const state = new stateClass();

            // When eval iterate with target
            const input = [0, 1, 2, 3];
            const iterate = new Iterate(input, { target });
            const actual = iterate.calc(state);

            // Then use specified repeating
            expect(actual).toBeCloseTo(input[finished]);
        }
    });

    test('use repeating specified by target with number', () => {
        const pairs: [number, number][] = [[1, 0], [3, 1]];
        for (const [target, finished] of pairs) {
            // Given repeating progress
            const stateClass = jest.fn<IFiringState>(() => ({
                getRepeatState: jest.fn().mockImplementation((position: number) => {
                    if (position === target) return { finished, total: 4 };
                    if (position === 2) return { finished: 2, total: 4 };
                    return { finished: 3, total: 4 };
                }),
            }));
            const state = new stateClass();

            // When eval iterate with target
            const input = [0, 1, 2, 3];
            const iterate = new Iterate(input, { target });
            const actual = iterate.calc(state);

            // Then use specified repeating
            expect(actual).toBeCloseTo(input[finished]);
        }
    });
});
