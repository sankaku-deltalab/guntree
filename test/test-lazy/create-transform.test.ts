import * as mat from 'transformation-matrix';

import { IFiringState } from 'guntree/firing-state';
import { ILazyEvaluative } from 'guntree/lazyEvaluative';
import { CreateTransform } from 'guntree/elements/lazyEvaluative';

const stateClass = jest.fn<IFiringState>();

const matKeys: ['a', 'b', 'c', 'd', 'e', 'f'] = ['a', 'b', 'c', 'd', 'e', 'f'];

describe('#CreateTransform', () => {
    test.each`
    tx      | ty
    ${-1}   | ${0}
    ${0}    | ${8}
    ${0.5}  | ${10}
    ${1}    | ${undefined}
    ${1.2}  | ${undefined}
    `('can use translate', ({ tx, ty }) => {
        // Given repeating progress
        const state = new stateClass();

        // And CreateTransform with translate
        const createTrans = new CreateTransform({ translate: [tx, ty] });

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
    ${1}    | ${undefined}
    ${1.2}  | ${undefined}
    `('can use translate with lazyEvaluative numbers', ({ tx, ty }) => {
        // Given repeating progress
        const state = new stateClass();

        // And translate as lazyEvaluative
        const leClass = jest.fn<ILazyEvaluative<number>>((val: number) => ({
            calc: jest.fn().mockReturnValueOnce(val),
        }));
        const txLe = new leClass(tx);
        const tyLe = ty === undefined ? undefined : new leClass(ty);

        // And CreateTransform with translate
        const createTrans = new CreateTransform({ translate: [txLe, tyLe] });

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
        const leClass = jest.fn<ILazyEvaluative<number>>((val: number) => ({
            calc: jest.fn().mockReturnValueOnce(val),
        }));
        const leRot = new leClass(rotationDeg);

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
    sx      | sy
    ${-1}   | ${0}
    ${0}    | ${8}
    ${0.5}  | ${10}
    ${1}    | ${undefined}
    ${1.2}  | ${undefined}
    `('can use scale', ({ sx, sy }) => {
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
    ${1}    | ${undefined}
    ${1.2}  | ${undefined}
    `('can use scale with lazyEvaluative numbers', ({ sx, sy }) => {
        // Given repeating progress
        const state = new stateClass();

        // And scale as lazyEvaluative
        const leClass = jest.fn<ILazyEvaluative<number>>((val: number) => ({
            calc: jest.fn().mockReturnValueOnce(val),
        }));
        const sxLe = new leClass(sx);
        const syLe = sy === undefined ? undefined : new leClass(sy);

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
