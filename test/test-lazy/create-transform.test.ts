import * as mat from 'transformation-matrix';

import { IFiringState } from 'guntree/firing-state';
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
});
