import { IFiringState, TVector2D } from 'guntree/gun';
import { AddVector } from 'guntree/elements/gunModifier';
import { ILazyEvaluative } from 'guntree/lazyEvaluative';

describe('#AddVector', () => {
    test('add constant vector to FiringState', () => {
        // Given firing state
        const name = 'a';
        const initialVec = { x: 1, y: 2 };
        const addVec = { x: 3, y: 4 };
        const expectedVec = { x: 4, y: 6 };

        // And firing state
        const firingStateClass = jest.fn<IFiringState>(() => ({
            vectors: new Map<string, TVector2D>([[name, initialVec]]),
        }));
        const state = new firingStateClass();

        // And SetVector
        const setVec = new AddVector(name, addVec);

        // When play AddVector with one frame
        const progress = setVec.play(state);
        const result = progress.next();

        // Then vector parameter was added to state
        expect(state.vectors.get(name)).toEqual(expectedVec);

        // And progress was finished
        expect(result.done).toBe(true);
    });

    test('add lazyEvaluative vector to FiringState', () => {
        // Given firing state
        const name = 'a';
        const initialVec = { x: 1, y: 2 };
        const addVec = { x: 3, y: 4 };
        const expectedVec = { x: 4, y: 6 };

        const leClass = jest.fn<ILazyEvaluative<TVector2D>>(vec => ({
            calc: jest.fn().mockReturnValueOnce(vec),
        }));

        // And firing state
        const firingStateClass = jest.fn<IFiringState>(() => ({
            vectors: new Map<string, TVector2D>([[name, initialVec]]),
        }));
        const state = new firingStateClass();

        // And AddVector
        const setVec = new AddVector(name, new leClass(addVec));

        // When play AddVector with one frame
        const progress = setVec.play(state);
        const result = progress.next();

        // Then vector parameter was added to state
        expect(state.vectors.get(name)).toEqual(expectedVec);

        // And progress was finished
        expect(result.done).toBe(true);
    });

    test('throw error if vector is not exist', () => {
        // Given firing state
        const name = 'a';

        // And firing state do not have vector
        const firingStateClass = jest.fn<IFiringState>(() => ({
            vectors: new Map<string, TVector2D>(),
        }));
        const state = new firingStateClass();

        // And AddVector
        const setVec = new AddVector(name, { x: 1, y: 2 });

        // When play AddVector with one frame
        const progress = setVec.play(state);
        const playing = () => progress.next();

        // Then AddVector throw error
        expect(playing).toThrowError();
    });
});
