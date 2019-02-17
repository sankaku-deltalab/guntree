import { IFiringState } from 'guntree/firing-state';
import { SetMuzzleNameImmediately } from 'guntree/elements/gunModifer';
import { ILazyEvaluative } from 'guntree/lazyEvaluative';

const stateClass = jest.fn<IFiringState>(() => ({
    fireData: { muzzle: null },
}));

describe('#SetMuzzleNameImmediately', () => {
    test('can set muzzle name', () => {
        // Given firing state
        const state = new stateClass();

        // And SetMuzzleNameImmediately
        const name = 'a';
        const setMuzzle = new SetMuzzleNameImmediately(name);

        // When play SetMuzzleNameImmediately
        setMuzzle.play(state).next();

        // Then muzzle was set
        expect(state.fireData.muzzle).toBe(name);
    });

    test('can set muzzle name with lazyEvaluative value', () => {
        // Given firing state
        const state = new stateClass();

        // And SetMuzzleNameImmediately
        const name = 'a';
        const leClass = jest.fn<ILazyEvaluative<string>>((v: string) => ({
            calc: jest.fn().mockReturnValueOnce(v),
        }));
        const setMuzzle = new SetMuzzleNameImmediately(new leClass(name));

        // When play SetMuzzleNameImmediately
        setMuzzle.play(state).next();

        // Then muzzle was set
        expect(state.fireData.muzzle).toBe(name);
    });
});
