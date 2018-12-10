import { IFiringState, TVector2D } from 'guntree/gun';
import { ILazyEvaluative, CalcDirection } from 'guntree/lazy-evaluative';

describe('#CalcDirection', () => {
    test('deal direction between two locations from constant vector', () => {
        // Given two locations
        const src: TVector2D = { x: 1, y: 2 };
        const dest: TVector2D = { x: 2, y: 3 };
        const expected = 45;

        // And repeating progress
        const stateClass = jest.fn<IFiringState>();
        const state = new stateClass();

        // When eval GetLocation
        const calcDir = new CalcDirection(src, dest);
        const actual = calcDir.calc(state);

        // Then deal rounded value
        expect(actual).toBeCloseTo(expected);
    });

    test('deal direction between two locations from lazy-evaluative vector', () => {
        // Given two locations as lazy-evaluative
        const leClass = jest.fn<ILazyEvaluative<TVector2D>>((vec: TVector2D) => ({
            calc: jest.fn().mockReturnValueOnce(vec),
        }));
        const src = new leClass({ x: 1, y: 2 });
        const dest = new leClass({ x: 2, y: 3 });
        const expected = 45;

        // And repeating progress
        const stateClass = jest.fn<IFiringState>();
        const state = new stateClass();

        // When eval GetLocation
        const calcDir = new CalcDirection(src, dest);
        const actual = calcDir.calc(state);

        // Then deal rounded value
        expect(actual).toBeCloseTo(expected);
    });
});
