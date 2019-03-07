import { IFiringState } from 'guntree/firing-state';
import { SetMuzzleImmediately } from 'guntree/elements/gunModifer';
import { ILazyEvaluative } from 'guntree/lazyEvaluative';
import { IMuzzle } from 'guntree/muzzle';

const stateClass = jest.fn<IFiringState>((muzzle: IMuzzle) => ({
    fireData: { muzzle: null },
    getMuzzleByName: jest.fn().mockReturnValueOnce(muzzle),
}));

describe('#SetMuzzleImmediately', () => {
    test('can set muzzle gotten from FiringState', () => {
        // Given Muzzle
        const muzzle = jest.fn();

        // And firing state
        const state = new stateClass(muzzle);

        // And SetMuzzleImmediately
        const name = 'a';
        const setMuzzle = new SetMuzzleImmediately(name);

        // When play SetMuzzleImmediately
        setMuzzle.play(state).next();

        // Then muzzle was set
        expect(state.fireData.muzzle).toBe(muzzle);

        // And set muzzle was gotten from state.getMuzzleByName
        expect(state.getMuzzleByName).toBeCalledWith(name);
    });

    test('can set muzzle name with lazyEvaluative value', () => {
        // Given Muzzle
        const muzzle = jest.fn();

        // And firing state
        const state = new stateClass(muzzle);

        // And SetMuzzleImmediately
        const name = 'a';
        const leClass = jest.fn<ILazyEvaluative<string>>((v: string) => ({
            calc: jest.fn().mockReturnValueOnce(v),
        }));
        const setMuzzle = new SetMuzzleImmediately(new leClass(name));

        // When play SetMuzzleImmediately
        setMuzzle.play(state).next();

        // Then muzzle was set
        expect(state.fireData.muzzle).toBe(muzzle);
    });
});
