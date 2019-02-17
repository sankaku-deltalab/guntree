import { FiringState } from 'guntree/firing-state';
import { IPlayer } from 'guntree/player';

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
});
