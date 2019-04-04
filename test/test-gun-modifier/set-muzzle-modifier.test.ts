import { IFiringState, IFireData } from 'guntree/firing-state';
import { SetMuzzleImmediatelyModifier } from 'guntree/elements/gunModifier';
import { IMuzzle } from 'guntree/muzzle';
import { simpleMock, leOnce } from '../util';

const stateClass = jest.fn<IFiringState>((muzzle: IMuzzle) => ({
    fireData: { muzzle: null },
    getMuzzleByName: jest.fn().mockReturnValueOnce(muzzle),
}));

describe('#SetMuzzleImmediatelyModifier', () => {
    test('can set muzzle gotten from FiringState', () => {
        // Given Muzzle
        const muzzle = simpleMock<IMuzzle>();

        // And firing state
        const state = new stateClass(muzzle);

        // And FireData
        const fd = simpleMock<IFireData>();

        // And SetMuzzleImmediatelyModifier
        const name = 'a';
        const setMuzzle = new SetMuzzleImmediatelyModifier(name);

        // When modify SetMuzzleImmediatelyModifier
        setMuzzle.modifyFireData(state, fd);

        // Then muzzle was set
        expect(state.muzzle).toBe(muzzle);

        // And set muzzle was gotten from state.getMuzzleByName
        expect(state.getMuzzleByName).toBeCalledWith(name);
    });

    test('can set muzzle name with lazyEvaluative value', () => {
        // Given Muzzle
        const muzzle = simpleMock<IMuzzle>();

        // And firing state
        const state = new stateClass(muzzle);

        // And FireData
        const fd = simpleMock<IFireData>();

        // And SetMuzzleImmediatelyModifier
        const nameConst = 'a';
        const nameLe = leOnce(nameConst);
        const setMuzzle = new SetMuzzleImmediatelyModifier(nameLe);

        // When modify SetMuzzleImmediatelyModifier
        setMuzzle.modifyFireData(state, fd);

        // Then muzzle was set
        expect(state.muzzle).toBe(muzzle);

        // And set muzzle was gotten from state.getMuzzleByName
        expect(state.getMuzzleByName).toBeCalledWith(nameConst);
    });
});
