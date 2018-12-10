import { IFiringState } from 'guntree/gun';
import { ILazyEvaluative } from 'guntree/lazy-evaluative';
import { CenterizedLinear } from 'guntree/contents/lazy-evaluative';

describe('#CenterizedLinear', () => {
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
    `('deal centerized linear value', ({ range, finished, total, expected }) => {
        // Given repeating progress
        const stateClass = jest.fn<IFiringState>(() => ({
            getRepeatState: jest.fn().mockReturnValueOnce({ finished, total }),
        }));
        const state = new stateClass();

        // When eval CenterizedLinear
        const cl = new CenterizedLinear(range);
        const actual = cl.calc(state);

        // Then deal expected
        expect(actual).toBeCloseTo(expected);
    });

    test.each`
    position | expected
    ${0}     | ${-15}
    ${1}     | ${-5}
    ${2}     | ${5}
    ${3}     | ${15}
    `('use specified repeating progress with number', ({ position, expected }) => {
        // Given repeating progress
        const range = 40;
        const stateClass = jest.fn<IFiringState>(() => ({
            getRepeatState: jest.fn().mockImplementation((position: number) => {
                if (position === 0) return { finished: 0, total: 4 };
                if (position === 1) return { finished: 1, total: 4 };
                if (position === 2) return { finished: 2, total: 4 };
                return { finished: 3, total: 4 };
            }),
        }));
        const state = new stateClass();

        // When eval CenterizedLinear with position
        const cl = new CenterizedLinear(range, position);
        const actual = cl.calc(state);

        // Then deal expected
        expect(actual).toBeCloseTo(expected);
    });

    test.each`
    target | expected
    ${'a'} | ${-15}
    ${'b'} | ${-5}
    `('use specified repeating progress with string', ({ target, expected }) => {
        // Given repeating progress
        const range = 40;
        const stateClass = jest.fn<IFiringState>(() => ({
            getRepeatStateByName: jest.fn().mockImplementation((name: string) => {
                if (name === 'a') return { finished: 0, total: 4 };
                if (name === 'b') return { finished: 1, total: 4 };
                return { finished: 3, total: 4 };
            }),
        }));
        const state = new stateClass();

        // When eval CenterizedLinear with name
        const cl = new CenterizedLinear(range, target);
        const actual = cl.calc(state);

        // Then deal expected
        expect(actual).toBeCloseTo(expected);
    });

    test('use previous repeating progress if not specified target', () => {
        // Given repeating progress
        const range = 40;
        const stateClass = jest.fn<IFiringState>(() => ({
            getRepeatState: jest.fn().mockImplementation((position: number) => {
                if (position === 0) return { finished: 0, total: 4 };
                return { finished: 3, total: 4 };
            }),
        }));
        const state = new stateClass();

        // When eval CenterizedLinear without target
        const cl = new CenterizedLinear(range);
        const actual = cl.calc(state);

        // Then deal expected
        expect(actual).toBeCloseTo(-15);
    });

    test('use lazy-evaluative totalRange', () => {
        // Given repeating progress
        const stateClass = jest.fn<IFiringState>(() => ({
            getRepeatState: jest.fn().mockImplementation((position: number) => {
                if (position === 0) return { finished: 0, total: 4 };
                return { finished: 3, total: 4 };
            }),
        }));
        const state = new stateClass();

        // And lazy-evaluative
        const range = 40;
        const leClass = jest.fn<ILazyEvaluative<number>>(() => ({
            calc: jest.fn().mockReturnValueOnce(range),
        }));
        const le = leClass();

        // When eval CenterizedLinear without target
        const cl = new CenterizedLinear(le);
        const actual = cl.calc(state);

        // Then deal expected
        expect(actual).toBeCloseTo(-15);
    });
});
