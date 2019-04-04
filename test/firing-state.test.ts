import { range } from 'lodash';
import * as mat from 'transformation-matrix';

import { FiringState, IFireData, IFireDataModifier } from 'guntree/firing-state';
import { IPlayer } from 'guntree/player';
import { IBullet } from 'guntree/gun';
import { IMuzzle } from 'guntree/muzzle';
import { simpleMock } from './util';

describe('#FiringState', () => {
    test('can add modifier and apply their', () => {
        // Given FireData as clone
        const fireDataClone = simpleMock<IFireData>();
        fireDataClone.transform = mat.translate(0);

        // And muzzle with transform
        const muzzle = simpleMock<IMuzzle>();
        muzzle.getMuzzleTransform = jest.fn().mockReturnValueOnce(mat.translate(0));

        // And FiringState with muzzle and FireData clone
        const state = new FiringState(simpleMock<IPlayer>());
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
        // Given FiringState
        const state = new FiringState(simpleMock<IPlayer>());

        // And FiringState's fireData's copy was pre-defined
        const dataClone = jest.fn();
        state.fireData.copy = jest.fn().mockReturnValueOnce(dataClone);

        // When copy FiringState
        const clone = state.copy();

        // Then copy's fireData is original's clone
        expect(clone.fireData).toBe(dataClone);
    });

    test('can copy with repeatStates', () => {
        // Given FiringState
        const state = new FiringState(simpleMock<IPlayer>());

        // And FiringState's repeatStates's copy was pre-defined
        const rsClone = jest.fn();
        state.repeatStates.copy = jest.fn().mockReturnValueOnce(rsClone);

        // When copy FiringState
        const clone = state.copy();

        // Then copy's repeatStates is original's clone
        expect(clone.repeatStates).toBe(rsClone);
    });

    test('can get muzzle by name', () => {
        // Given Player with muzzle
        const muzzleClass = jest.fn<IMuzzle>();
        const muzzle = new muzzleClass();
        const playerClass = jest.fn<IPlayer>(() => ({
            getMuzzle: jest.fn().mockReturnValueOnce(muzzle),
        }));
        const player = new playerClass();

        // And FiringState
        const state = new FiringState(player);

        // When get muzzle by name
        const muzzleName = 'a';
        const currentMuzzle = state.getMuzzleByName(muzzleName);

        // Then gotten muzzle is Player's muzzle from player
        expect(currentMuzzle).toBe(muzzle);
        expect(player.getMuzzle).toBeCalledWith(muzzleName);
    });

    test('can call fire and pass firing to muzzle', () => {
        // Given FiringState with muzzle.
        const muzzleClass = jest.fn<IMuzzle>(() => ({
            fire: jest.fn(),
        }));
        const fireDataClass = jest.fn<IFireData>();
        const state = new FiringState(simpleMock<IPlayer>());
        const muzzle = new muzzleClass();
        const modifiedFireData = new fireDataClass();
        state.muzzle = muzzle;
        state.calcModifiedFireData = jest.fn().mockReturnValueOnce(modifiedFireData);

        // And Bullet
        const bulletClass = jest.fn<IBullet>(() => ({}));
        const bullet = new bulletClass();

        // And FiringState's repeatStates's copy was pre-defined
        const rsClone = jest.fn();
        state.repeatStates.copy = jest.fn().mockReturnValueOnce(rsClone);

        // When fire
        state.fire(bullet);

        // Then FiringState pass firing to muzzle with modified fire data
        expect(muzzle.fire).toBeCalledWith(modifiedFireData, bullet);
    });

    test('use muzzle transform in calcModifiedFireData', () => {
        // Given muzzle
        const muzzle = simpleMock<IMuzzle>();
        const muzzleTrans = mat.translate(1.2, 5.3);
        muzzle.getMuzzleTransform = jest.fn().mockReturnValueOnce(muzzleTrans);

        // And firing state with muzzle and FireData clone
        const state = new FiringState(simpleMock<IPlayer>());
        state.muzzle = muzzle;

        // When calc modified fireData
        const modifiedFD = state.calcModifiedFireData();

        // Then
        expect(modifiedFD.transform).toEqual(muzzleTrans);
    });
});
