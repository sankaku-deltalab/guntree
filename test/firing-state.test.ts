import { range } from 'lodash';
import * as mat from 'transformation-matrix';

import { FiringState, IFireData, IFireDataModifier, IRepeatStateManager } from 'guntree/firing-state';
import { IPlayer } from 'guntree/player';
import { IBullet } from 'guntree/gun';
import { IMuzzle } from 'guntree/muzzle';
import { simpleMock } from './util';

const createSimpleFireDataMock = () => {
    const fireData = simpleMock<IFireData>();
    const fireDataClone = simpleMock<IFireData>();
    fireData.copy = jest.fn().mockReturnValueOnce(fireDataClone);
    return [fireData, fireDataClone];
};

const createSimpleRSMMock = () => {
    const rsm = simpleMock<IRepeatStateManager>();
    const rsmClone = simpleMock<IRepeatStateManager>();
    rsm.copy = jest.fn().mockReturnValueOnce(rsmClone);
    return [rsm, rsmClone];
};

describe('#FiringState', () => {
    test('can add modifier and apply their', () => {
        // Given FireData with clone
        const [fireData, fireDataClone] = createSimpleFireDataMock();
        fireDataClone.transform = mat.translate(0);

        // And muzzle with transform
        const muzzle = simpleMock<IMuzzle>();
        muzzle.getMuzzleTransform = jest.fn().mockReturnValueOnce(mat.translate(0));

        // And FiringState with muzzle and FireData clone
        const state = new FiringState(
            simpleMock<IPlayer>(), fireData, simpleMock<IRepeatStateManager>(),
        );
        state.muzzle = muzzle;
        state.fireData.copy = jest.fn().mockReturnValueOnce(fireDataClone);

        // And modifiers
        const calledModifiers: IFireDataModifier[] = [];
        const modifiers = range(3).map(() => {
            const mod = simpleMock<IFireDataModifier>();
            mod.modifyFireData = jest.fn().mockImplementation(() => calledModifiers.push(mod));
            return mod;
        });

        // When push modifiers to FiringState
        modifiers.map(m => state.pushModifier(m));

        // And calc modified fireData
        state.calcModifiedFireData();

        // Then modifiers are called with fireData copy
        modifiers.map((mod) => {
            expect(mod.modifyFireData).toBeCalledWith(state, fireDataClone);
            expect(mod.modifyFireData).toBeCalledTimes(1);
        });

        // And modifiers are called as reversed order
        expect(calledModifiers).toEqual(modifiers.reverse());
    });

    test('can copy with fireData', () => {
        // Given FireData with clone
        const [fireData, fireDataClone] = createSimpleFireDataMock();

        // And RepeatStateManager with clone
        const [rsm, rsmClone] = createSimpleRSMMock();

        // And FiringState
        const state = new FiringState(simpleMock(), fireData, rsm);

        // When copy FiringState
        const clone = state.copy();

        // Then copy's fireData is original's clone
        expect(clone.fireData).toBe(fireDataClone);
    });

    test('can copy with repeatStates', () => {
        // Given FireData with clone
        const [fireData, fireDataClone] = createSimpleFireDataMock();

        // And RepeatStateManager with clone
        const [rsm, rsmClone] = createSimpleRSMMock();

        // And FiringState
        const state = new FiringState(simpleMock(), fireData, rsm);

        // When copy FiringState
        const clone = state.copy();

        // Then copy's repeatStates is original's clone
        expect(clone.repeatStates).toBe(rsmClone);
    });

    test('can copy with muzzle', () => {
        // Given FireData with clone
        const [fireData, fireDataClone] = createSimpleFireDataMock();

        // And RepeatStateManager with clone
        const [rsm, rsmClone] = createSimpleRSMMock();

        // And Muzzle
        const muzzle = simpleMock<IMuzzle>();

        // Given FiringState with muzzle
        const state = new FiringState(simpleMock(), fireData, rsm);
        state.muzzle = muzzle;

        // When copy FiringState
        const clone = state.copy();

        // Then copy's repeatStates is original's clone
        expect(clone.muzzle).toBe(muzzle);
    });

    test('can get muzzle by name', () => {
        // Given Player with muzzle
        const muzzle = simpleMock<IMuzzle>();
        const player = simpleMock<IPlayer>();
        player.getMuzzle = jest.fn().mockReturnValueOnce(muzzle);

        // And FiringState
        const state = new FiringState(player, simpleMock(), simpleMock());

        // When get muzzle by name
        const muzzleName = 'a';
        const gottenMuzzle = state.getMuzzleByName(muzzleName);

        // Then gotten muzzle is Player's muzzle
        expect(gottenMuzzle).toBe(muzzle);
        expect(player.getMuzzle).toBeCalledWith(muzzleName);
    });

    test('can call fire and pass firing to muzzle', () => {
        // Given Muzzle can fire
        const muzzle = simpleMock<IMuzzle>();
        muzzle.fire = jest.fn();

        // And RepeatStateManager with clone
        const rsm = simpleMock<IRepeatStateManager>();
        const rsmClone = simpleMock<IRepeatStateManager>();
        rsm.copy = jest.fn().mockReturnValueOnce(rsmClone);

        // And FiringState with muzzle and can calcModifiedFireData
        const state = new FiringState(simpleMock(), simpleMock(), rsm);
        state.muzzle = muzzle;
        const modifiedFireData = simpleMock<IFireData>();
        state.calcModifiedFireData = jest.fn().mockReturnValueOnce(modifiedFireData);

        // And Bullet
        const bullet = simpleMock<IBullet>();

        // When fire
        state.fire(bullet);

        // Then FiringState pass firing to muzzle with modified fire data
        expect(muzzle.fire).toBeCalledWith(modifiedFireData, bullet);
    });

    test('use muzzle transform in calcModifiedFireData', () => {
        // Given FireData with clone
        const [fireData, fireDataClone] = createSimpleFireDataMock();
        fireDataClone.transform = mat.translate(0);

        // And RepeatStateManager with clone
        const [rsm, rsmClone] = createSimpleRSMMock();

        // And muzzle
        const muzzle = simpleMock<IMuzzle>();
        const muzzleTrans = mat.translate(1.2, 5.3);
        muzzle.getMuzzleTransform = jest.fn().mockReturnValueOnce(muzzleTrans);

        // And firing state with muzzle and FireData clone
        const state = new FiringState(simpleMock(), fireData, rsm);
        state.muzzle = muzzle;

        // When calc modified fireData
        const modifiedFD = state.calcModifiedFireData();

        // Then
        expect(modifiedFD.transform).toEqual(muzzleTrans);
    });
});
