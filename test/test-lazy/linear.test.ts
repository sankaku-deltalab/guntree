import { IFiringState } from 'guntree/firing-state';
import { ILazyEvaluative } from 'guntree/lazyEvaluative';
import { Linear } from 'guntree/elements/lazyEvaluative';

describe('#Linear', () => {
    test.each([
        [0, 1, 10],
        [0, 2, 10],
        [1, 2, 15],
        [1, 4, 12.5],
    ])('deal linear value with respect to repeating progress (%i, %i)', async (finished, total, expected) => {
        // Given repeating progress
        const [start, stop] = [10, 20];
        const stateClass = jest.fn<IFiringState>(() => ({
            getRepeatState: jest.fn().mockReturnValueOnce({ finished, total }),
        }));
        const state = new stateClass();

        // When eval Linear with (start, stop)
        const linear = new Linear(start, stop);
        const actual = linear.calc(state);

        // Then deal expected
        expect(actual).toBeCloseTo(expected);
    });

    test.each`
    start | stop  | finished | total | expected
    ${0}  | ${1}  | ${0}     | ${1}  | ${0}
    ${0}  | ${1}  | ${0}     | ${2}  | ${0}
    ${0}  | ${1}  | ${1}     | ${2}  | ${0.5}
    ${10} | ${30} | ${1}     | ${4}  | ${15}
    `('can use LazyEvaluative to start and stop', async ({ start, stop, finished, total, expected }) => {
        // Given repeating progress
        const stateClass = jest.fn<IFiringState>(() => ({
            getRepeatState: jest.fn().mockReturnValueOnce({ finished, total }),
        }));
        const state = new stateClass();

        // When eval Linear with (start, stop)
        const leClass = jest.fn<ILazyEvaluative<number>>((val: number) => ({
            calc: jest.fn().mockReturnValueOnce(val),
        }));
        const linear = new Linear(new leClass(start), new leClass(stop));
        const actual = linear.calc(state);

        // Then deal expected
        expect(actual).toBeCloseTo(expected);
    });

    test.each([
        [0, 0],
        [2, 20],
    ])('use specified repeating progress with number (%p)', async (position, expected) => {
        // Given repeating progress
        const [start, stop] = [0, 40];
        const stateClass = jest.fn<IFiringState>(() => ({
            getRepeatState: jest.fn().mockImplementation((position: number) => {
                if (position === 0) return { finished: 0, total: 4 };
                if (position === 2) return { finished: 2, total: 4 };
                return { finished: 3, total: 4 };
            }),
        }));
        const state = new stateClass();

        // When eval Linear with name
        const linear = new Linear(start, stop, position);
        const actual = linear.calc(state);

        // Then deal expected
        expect(actual).toBeCloseTo(expected);
    });

    test.each([
        ['a', 0],
        ['b', 10],
    ])('use specified repeating progress with string (%s)', async (target, expected) => {
        // Given repeating progress
        const [start, stop] = [0, 40];
        const stateClass = jest.fn<IFiringState>(() => ({
            getRepeatState: jest.fn().mockImplementation((name: string) => {
                if (name === 'a') return { finished: 0, total: 4 };
                if (name === 'b') return { finished: 1, total: 4 };
                return { finished: 3, total: 4 };
            }),
        }));
        const state = new stateClass();

        // When eval Linear with name
        const linear = new Linear(start, stop, target);
        const actual = linear.calc(state);

        // Then deal expected
        expect(actual).toBeCloseTo(expected);
    });

    test('use previous repeating progress if not specified target', () => {
        // Given repeating progress
        const [start, stop] = [0, 40];
        const stateClass = jest.fn<IFiringState>(() => ({
            getRepeatState: jest.fn().mockImplementation(() => {
                return { finished: 0, total: 4 };
            }),
        }));
        const state = new stateClass();

        // When eval Linear with name
        const linear = new Linear(start, stop);
        const actual = linear.calc(state);

        // Then deal expected
        expect(actual).toBeCloseTo(0);
    });
});
