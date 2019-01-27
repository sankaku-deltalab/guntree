import * as mat from 'transformation-matrix';

import { IFiringState, FiringState } from 'guntree/firing-state';
import { Transform } from 'guntree/elements/gunModifer';
import { IPlayer } from 'guntree/player';
import { ILazyEvaluative } from 'guntree/lazyEvaluative';

describe('#Transform', () => {
    test('push modifier when played', () => {
        // Given firing state
        const stateClass = jest.fn<IFiringState>(() => ({
            pushModifier: jest.fn(),
        }));
        const state = new stateClass();

        // And Transform
        const trans = mat.translate(5);
        const transform = new Transform(trans);

        // When play Transform
        transform.play(state).next();

        // Then modifier was pushed
        expect(state.pushModifier).toBeCalledTimes(1);
    });

    test('generate modifier transform fireData', () => {
        // Given firing state
        const state = new FiringState(new (jest.fn<IPlayer>()));

        // And Transform
        const trans = mat.translate(5);
        const transform = new Transform(trans);

        // When play Transform
        transform.play(state).next();

        // And calc modified fire data
        const fireData = state.calcModifiedFireData();

        // Then transform in fireData was transformed
        expect(fireData.transform).toEqual(trans);
    });

    test('can use lazyEvaluative transform', () => {
        // Given firing state
        const state = new FiringState(new (jest.fn<IPlayer>()));

        // And Transform
        const leClass = jest.fn<ILazyEvaluative<mat.Matrix>>((t: mat.Matrix) => ({
            calc: jest.fn().mockReturnValueOnce(t),
        }));
        const transRaw = mat.translate(5);
        const trans = new leClass(transRaw);
        const transform = new Transform(trans);

        // When play Transform
        transform.play(state).next();

        // And calc modified fire data
        const fireData = state.calcModifiedFireData();

        // Then transform in fireData was transformed
        expect(fireData.transform).toEqual(transRaw);
    });
});
