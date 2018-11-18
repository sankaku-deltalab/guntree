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
        // Given repeating progress in second repeat
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
});
