import * as mat from 'transformation-matrix';

import { IFiringState } from 'guntree/firing-state';
import { ILazyEvaluative } from 'guntree/lazyEvaluative';
import { CreateTransform } from 'guntree/elements/lazyEvaluative';

const stateClass = jest.fn<IFiringState>();

const leClassCalcValueOnce = jest.fn<ILazyEvaluative<number>>((val: number) => ({
    calc: jest.fn().mockReturnValueOnce(val),
}));

const matKeys: ['a', 'b', 'c', 'd', 'e', 'f'] = ['a', 'b', 'c', 'd', 'e', 'f'];

describe('#CreateTransform', () => {
    test.each`
    translation
    ${-1}
    ${0}
    ${0.5}
    ${1}
    ${1.2}
    `('can use translation with single value', ({ translation }) => {
        // Given repeating progress
        const state = new stateClass();

        // And CreateTransform with translation
        const createTrans = new CreateTransform({ translation });

        // When eval CreateTransform
        const actual = createTrans.calc(state);

        // Then translated matrix was dealt
        const expected = mat.translate(translation);
        for (const key of matKeys) {
            expect(actual[key]).toBeCloseTo(expected[key]);
        }
    });

    test.each`
    translation
    ${-1}
    ${0}
    ${0.5}
    ${1}
    ${1.2}
    `('can use translation with single lazyEvaluative value', ({ translation }) => {
        // Given repeating progress
        const state = new stateClass();

        // And translation as lazyEvaluative
        const translationLe = new leClassCalcValueOnce(translation);

        // And CreateTransform with translation
        const createTrans = new CreateTransform({ translation: translationLe });

        // When eval CreateTransform
        const actual = createTrans.calc(state);

        // Then translated matrix was dealt
        const expected = mat.translate(translation);
        for (const key of matKeys) {
            expect(actual[key]).toBeCloseTo(expected[key]);
        }
    });

    test.each`
    tx      | ty
    ${-1}   | ${0}
    ${0}    | ${8}
    ${0.5}  | ${10}
    `('can use translation with double value', ({ tx, ty }) => {
        // Given repeating progress
        const state = new stateClass();

        // And CreateTransform with translation
        const createTrans = new CreateTransform({ translation: [tx, ty] });

        // When eval CreateTransform
        const actual = createTrans.calc(state);

        // Then translated matrix was dealt
        const expected = mat.translate(tx, ty);
        for (const key of matKeys) {
            expect(actual[key]).toBeCloseTo(expected[key]);
        }
    });

    test.each`
    tx      | ty
    ${-1}   | ${0}
    ${0}    | ${8}
    ${0.5}  | ${10}
    `('can use translation with double lazyEvaluative values', ({ tx, ty }) => {
        // Given repeating progress
        const state = new stateClass();

        // And translation as lazyEvaluative
        const txLe = new leClassCalcValueOnce(tx);
        const tyLe = new leClassCalcValueOnce(ty);

        // And CreateTransform with translation
        const createTrans = new CreateTransform({ translation: [txLe, tyLe] });

        // When eval CreateTransform
        const actual = createTrans.calc(state);

        // Then translated matrix was dealt
        const expected = mat.translate(tx, ty);
        for (const key of matKeys) {
            expect(actual[key]).toBeCloseTo(expected[key]);
        }
    });

    test.each`
    rotationDeg
    ${0}
    ${30}
    ${90}
    ${-45}
    ${720}
    `('can use rotate as degrees', ({ rotationDeg }) => {
        // Given repeating progress
        const state = new stateClass();

        // And CreateTransform with angleDeg
        const createTrans = new CreateTransform({ rotationDeg });

        // When eval CreateTransform
        const actual = createTrans.calc(state);

        // Then rotated matrix was dealt
        const expected = mat.rotateDEG(rotationDeg);
        for (const key of matKeys) {
            expect(actual[key]).toBeCloseTo(expected[key]);
        }
    });

    test.each`
    rotationDeg
    ${0}
    ${30}
    ${90}
    ${-45}
    ${720}
    `('can use rotate as degrees with lazyEvaluative number', ({ rotationDeg }) => {
        // Given repeating progress
        const state = new stateClass();

        // And angle as lazyEvaluative
        const leRot = new leClassCalcValueOnce(rotationDeg);

        // And CreateTransform with angleDeg
        const createTrans = new CreateTransform({ rotationDeg: leRot });

        // When eval CreateTransform
        const actual = createTrans.calc(state);

        // Then rotated matrix was dealt
        const expected = mat.rotateDEG(rotationDeg);
        for (const key of matKeys) {
            expect(actual[key]).toBeCloseTo(expected[key]);
        }
    });
    test.each`
    scale
    ${-1}
    ${0}
    ${0.5}
    ${1}
    ${1.2}
    `('can use scale with single value', ({ scale }) => {
        // Given repeating progress
        const state = new stateClass();

        // And CreateTransform with scale
        const createTrans = new CreateTransform({ scale });

        // When eval CreateTransform
        const actual = createTrans.calc(state);

        // Then scale matrix was dealt
        const expected = mat.scale(scale);
        for (const key of matKeys) {
            expect(actual[key]).toBeCloseTo(expected[key]);
        }
    });

    test.each`
    scale
    ${-1}
    ${0}
    ${0.5}
    ${1}
    ${1.2}
    `('can use scale with single lazyEvaluative value', ({ scale }) => {
        // Given repeating progress
        const state = new stateClass();

        // And scale as lazyEvaluative
        const scaleLe = new leClassCalcValueOnce(scale);

        // And CreateTransform with scale
        const createTrans = new CreateTransform({ scale: scaleLe });

        // When eval CreateTransform
        const actual = createTrans.calc(state);

        // Then scale matrix was dealt
        const expected = mat.scale(scale);
        for (const key of matKeys) {
            expect(actual[key]).toBeCloseTo(expected[key]);
        }
    });

    test.each`
    sx      | sy
    ${-1}   | ${0}
    ${0}    | ${8}
    ${0.5}  | ${10}
    `('can use scale with double value', ({ sx, sy }) => {
        // Given repeating progress
        const state = new stateClass();

        // And CreateTransform with scale
        const createTrans = new CreateTransform({ scale: [sx, sy] });

        // When eval CreateTransform
        const actual = createTrans.calc(state);

        // Then rotated matrix was dealt
        const expected = mat.scale(sx, sy);
        for (const key of matKeys) {
            expect(actual[key]).toBeCloseTo(expected[key]);
        }
    });

    test.each`
    sx      | sy
    ${-1}   | ${0}
    ${0}    | ${8}
    ${0.5}  | ${10}
    `('can use scale with single lazyEvaluative value', ({ sx, sy }) => {
        // Given repeating progress
        const state = new stateClass();

        // And scale as lazyEvaluative
        const sxLe = new leClassCalcValueOnce(sx);
        const syLe = new leClassCalcValueOnce(sy);

        // And CreateTransform with scale
        const createTrans = new CreateTransform({ scale: [sxLe, syLe] });

        // When eval CreateTransform
        const actual = createTrans.calc(state);

        // Then rotated matrix was dealt
        const expected = mat.scale(sx, sy);
        for (const key of matKeys) {
            expect(actual[key]).toBeCloseTo(expected[key]);
        }
    });
});
