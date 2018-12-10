import { IFiringState, TVector2D } from 'guntree/gun';
import { ILazyEvaluative, GlobalizeVector } from 'guntree/lazy-evaluative';

describe('#GlobalizeVector', () => {
    test('calc globalized vector localized by angle', () => {
        // Given parameters
        const offset = { x: 1, y: Math.sqrt(3) };  // length: sqrt(2), angle: 60
        const angle = -15;
        const expected = { x: Math.sqrt(2), y: Math.sqrt(2) };  // length: sqrt(2), angle: 45

        // And firing state
        const firingStateClass = jest.fn<IFiringState>();
        const state = new firingStateClass();

        // And GlobalizeVector
        const alv = new GlobalizeVector(offset, angle);

        // When evaluate GlobalizeVector
        const actual = alv.calc(state);

        // Then vector was added
        expect(actual.x).toBeCloseTo(expected.x);
        expect(actual.y).toBeCloseTo(expected.y);
    });

    test('can use lazy-evaluative to vector and angle', () => {
        // Given parameters
        const offset = { x: 1, y: Math.sqrt(3) };
        const angle = -15;
        const expected = { x: Math.sqrt(2), y: Math.sqrt(2) };
        const leClassVec = jest.fn<ILazyEvaluative<TVector2D>>(val => ({
            calc: jest.fn().mockReturnValueOnce(val),
        }));
        const leClassNum = jest.fn<ILazyEvaluative<number>>(val => ({
            calc: jest.fn().mockReturnValueOnce(val),
        }));

        // And firing state
        const firingStateClass = jest.fn<IFiringState>();
        const state = new firingStateClass();

        // And GlobalizeVector
        const alv = new GlobalizeVector(new leClassVec(offset), new leClassNum(angle));

        // When evaluate GlobalizeVector
        const actual = alv.calc(state);

        // Then vector was added
        expect(actual.x).toBeCloseTo(expected.x);
        expect(actual.y).toBeCloseTo(expected.y);
    });
});
