import { FiringState } from 'guntree/firing-state';
import { IPlayer } from 'guntree/player';

const mockPlayerClass = jest.fn<IPlayer>(() => ({}));

describe('#FiringState', () => {
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
