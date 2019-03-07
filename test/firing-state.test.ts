import { FiringState, IFireData } from 'guntree/firing-state';
import { IPlayer } from 'guntree/player';
import { IBullet } from 'guntree/gun';
import { IMuzzle } from 'guntree/muzzle';

const mockPlayerClass = jest.fn<IPlayer>(() => ({}));

describe('#FiringState', () => {
    test('can add modifier and apply their', () => {
        // Given FiringState
        const state = new FiringState(new mockPlayerClass());
        const fireDataClone = jest.fn();
        state.fireData.copy = jest.fn().mockReturnValueOnce(fireDataClone);

        // And modifiers are pushed to FiringState
        const calledModifiers: jest.Mock[] = [];
        const genMod = () => {
            const mod = jest.fn().mockImplementationOnce(() => calledModifiers.push(mod));
            return mod;
        };
        const modifiers = [
            genMod(),
            genMod(),
        ];
        modifiers.map(m => state.pushModifier(m));

        // When calc modified fireData
        state.calcModifiedFireData();

        // Then modifiers are called with fireData copy
        modifiers.map((mod) => {
            expect(mod).toBeCalledWith(state, fireDataClone);
            expect(mod).toBeCalledTimes(1);
        });

        // And modifiers are called as reversed order
        expect(calledModifiers).toEqual(modifiers.reverse());
    });

    test('can copy with fireData', () => {
        // Given FiringState
        const state = new FiringState(new mockPlayerClass());

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
        const state = new FiringState(new mockPlayerClass());

        // And FiringState's repeatStates's copy was pre-defined
        const rsClone = jest.fn();
        state.repeatStates.copy = jest.fn().mockReturnValueOnce(rsClone);

        // When copy FiringState
        const clone = state.copy();

        // Then copy's repeatStates is original's clone
        expect(clone.repeatStates).toBe(rsClone);
    });

    test('can get current using muzzle from fireData', () => {
        // Given FiringState
        const state = new FiringState(new (jest.fn<IPlayer>()));

        // When fireData's muzzle was set
        const muzzleClass = jest.fn<IMuzzle>();
        const muzzle = new muzzleClass();
        state.fireData.muzzle = muzzle;

        // And get current muzzle from FiringState
        const currentMuzzle = state.getCurrentMuzzle();

        // Then gotten muzzle is Player's muzzle
        expect(currentMuzzle).toBe(muzzle);
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
        // Given FiringState with fake getCurrentMuzzle() and calcModifiedFireData().
        const state = new FiringState(new mockPlayerClass());
        const muzzleClass = jest.fn(() => ({
            fire: jest.fn(),
        }));
        const muzzle = new muzzleClass();
        const fireDataClass = jest.fn<IFireData>();
        const modifiedFireData = new fireDataClass();
        state.getCurrentMuzzle = jest.fn().mockReturnValueOnce(muzzle);
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
});
