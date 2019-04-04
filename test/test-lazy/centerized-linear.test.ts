import { IFiringState, IRepeatStateManager } from 'guntree/firing-state';
import { ILazyEvaluative } from 'guntree/lazyEvaluative';
import { CenterizedLinear } from 'guntree/elements/lazyEvaluative';

const repeatStateManagerClass = jest.fn<IRepeatStateManager>((getFunc: jest.Mock) => ({
    get: getFunc,
}));

const stateClass = jest.fn<IFiringState>((rsm: IRepeatStateManager) => ({
    repeatStates: rsm,
}));

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
        const rsm = new repeatStateManagerClass(jest.fn().mockReturnValueOnce({ finished, total }));
        const state = new stateClass(rsm);

        // When eval CenterizedLinear
        const cl = new CenterizedLinear(range);
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
        const rsm = new repeatStateManagerClass(jest.fn().mockImplementation((name: string) => {
            if (name === 'a') return { finished: 0, total: 4 };
            if (name === 'b') return { finished: 1, total: 4 };
            return { finished: 3, total: 4 };
        }));
        const state = new stateClass(rsm);

        // When eval CenterizedLinear with name
        const cl = new CenterizedLinear(range, target);
        const actual = cl.calc(state);

        // Then deal expected
        expect(actual).toBeCloseTo(expected);
    });

    test('use previous repeating progress if not specified target', () => {
        // Given repeating progress
        const range = 40;
        const rsm = new repeatStateManagerClass(jest.fn().mockReturnValueOnce({ finished: 0, total: 4 }));
        const state = new stateClass(rsm);

        // When eval CenterizedLinear without target
        const cl = new CenterizedLinear(range);
        const actual = cl.calc(state);

        // Then deal expected
        expect(actual).toBeCloseTo(-15);
    });

    test('use lazyEvaluative totalRange', () => {
        // Given repeating progress
        const rsm = new repeatStateManagerClass(jest.fn().mockReturnValueOnce({ finished: 0, total: 4 }));
        const state = new stateClass(rsm);

        // And lazyEvaluative
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
