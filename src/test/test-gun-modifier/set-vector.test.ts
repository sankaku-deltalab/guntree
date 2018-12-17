import { IFiringState, TVector2D } from 'guntree/gun';
import { SetVector } from 'guntree/contents/gunModifier';
import { ILazyEvaluative } from 'guntree/lazyEvaluative';

describe('#SetVector', () => {
    test('set constant vector to FiringState', () => {
        // Given firing state
        const firingStateClass = jest.fn<IFiringState>(() => ({
            vectors: new Map<string, TVector2D>(),
        }));
        const state = new firingStateClass();

        // And vector
        const vec: TVector2D = { x: 1, y: 2 };

        // And SetVector
        const name = 'a';
        const setVec = new SetVector(name, vec);

        // When play SetVector with one frame
        const progress = setVec.play(state);
        progress.next();

        // Then vector parameter was set to state
        expect(state.vectors.get(name)).toBe(vec);
    });

    test('set lazyEvaluative vector to FiringState', () => {
        // Given firing state
        const firingStateClass = jest.fn<IFiringState>(() => ({
            vectors: new Map<string, TVector2D>(),
        }));
        const state = new firingStateClass();

        // And vector
        const vec: TVector2D = { x: 1, y: 2 };
        const leClass = jest.fn<ILazyEvaluative<TVector2D>>(() => ({
            calc: jest.fn().mockReturnValueOnce(vec),
        }));
        const vecLe = new leClass();

        // And SetVector
        const name = 'a';
        const setVec = new SetVector(name, vecLe);

        // When play SetVector with one frame
        const progress = setVec.play(state);
        progress.next();

        // Then vector parameter was set to state
        expect(state.vectors.get(name)).toBe(vec);
    });
});
