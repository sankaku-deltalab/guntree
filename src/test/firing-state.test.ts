import { range } from 'lodash';

import { IRepeatState, FiringState } from 'guntree/gun';
import { Parameter } from 'guntree/parameter';
import { IPlayer } from 'guntree/player';

const createPlayer = (): IPlayer => {
    const plClass = jest.fn<IPlayer>();
    return new plClass();
};

describe('#FiringState', () => {
    test('can copy self with parameter', () => {
        // Given Parameter and clone
        const paramClass = jest.fn<Parameter>((cloned: Parameter) => ({
            copy: jest.fn().mockReturnValueOnce(cloned),
        }));
        const paramClone = new paramClass();
        const param = new paramClass(paramClone);

        // And Player
        const player = createPlayer();

        // And firing state with parameter
        const paramName = 'a';
        const state = new FiringState(player);
        state.parameters.set(paramName, param);

        // When copy firing state
        const clone = state.copy();

        // Then clone has cloned parameter
        expect(clone.parameters.get(paramName)).toBe(paramClone);
    });

    test('can copy self with texts', () => {
        // Given Player
        const player = createPlayer();

        // And firing state with parameter
        const paramName = 'a';
        const text = 'abc';
        const state = new FiringState(player);
        state.texts.set(paramName, text);

        // When copy firing state
        const clone = state.copy();

        // Then clone has cloned parameter
        expect(clone.texts.get(paramName)).toBe(text);
    });

    test('can copy self with repeat state', () => {
        // Given RepeatStates
        const rsNum = 6;
        const rsList = range(rsNum).map(v => ({ finished: v, total: rsNum + 1 }));

        // And firing state
        const state = new FiringState(createPlayer());
        for (const rs of rsList) {
            state.startRepeating(rs);
        }

        // When copy firing state
        const clone = state.copy();

        // Then clone has state
        let idx = 0;
        for (const rs of rsList.reverse()) {
            expect(clone.getRepeatState(idx)).toBe(rs);
            idx += 1;
        }
        expect(idx).toBeGreaterThan(0);
    });

    test('can copy self with repeat state and their name', () => {
        // Given RepeatStates
        const rsNum = 6;
        const rsListAndName = range(rsNum).map<[IRepeatState, string]>(
            v => [{ finished: v, total: rsNum + 1 }, v.toString()]);

        // And firing state
        const state = new FiringState(createPlayer());
        for (const [rs, name] of rsListAndName) {
            state.startRepeating(rs, name);
        }

        // When copy firing state
        const clone = state.copy();

        // Then clone has state
        let anyNamesRepeatingIsExist = false;
        for (const [rs, name] of rsListAndName.reverse()) {
            expect(clone.getRepeatStateByName(name)).toBe(rs);
            anyNamesRepeatingIsExist = true;
        }
        expect(anyNamesRepeatingIsExist).toBe(true);
    });

    test('can get current repeat state', () => {
        // Given repeating state
        const repeatState: IRepeatState = { finished: 0, total: 10 };

        // And Player
        const player = createPlayer();

        // And firing state
        const state = new FiringState(player);

        // When start repeating
        state.startRepeating(repeatState);

        // And get repeat state
        const actual = state.getRepeatState(0);

        // Then dealt state is started repeat state
        expect(actual).toBe(repeatState);
    });

    test.each`
        position
        ${0}
        ${1}
        ${2}
    `('can get nested repeat state', ({ position }) => {
        // Given repeating state list
        const nest = 10;
        const repeatStates: IRepeatState[] = [];
        for (const i of range(nest)) {
            repeatStates.push({ finished: i * 2, total: nest * 3 });
        }

        // And Player
        const player = createPlayer();

        // And firing state
        const state = new FiringState(player);

        // When start nested repeating
        for (const rs of repeatStates) {
            state.startRepeating(rs);
        }

        // And get repeat state
        const actual = state.getRepeatState(position);

        // Then dealt state is expected position's state
        expect(actual).toBe(repeatStates.reverse()[position]);
    });

    test('can get repeat state by name', () => {
        // Given Player
        const player = createPlayer();

        // And firing state
        const state = new FiringState(player);

        // When start repeating with name
        const name = 'a';
        const rs = state.startRepeating({ finished: 0, total: 10 }, name);

        // And get repeating with name
        const actual = state.getRepeatStateByName(name);

        // Then get repeating
        expect(actual).toBe(rs);
    });

    test('throw error if get repeat state by name and not contain repeating with that name', () => {
        // Given Player
        const player = createPlayer();

        // And firing state
        const state = new FiringState(player);

        // When start repeating with name
        const name = 'a';
        const badName = 'b';
        state.startRepeating({ finished: 0, total: 10 }, name);

        // And get repeating with name
        const func = () => state.getRepeatStateByName(badName);

        // Then throw error repeating
        expect(func).toThrowError();
    });

    test('can get repeat state by name with nested repeating', () => {
        // Given Player
        const player = createPlayer();

        // And firing state
        const state = new FiringState(player);

        // When start repeating with name twice
        const name = 'a';
        const rs1 = state.startRepeating({ finished: 0, total: 10 }, name);
        const rs2 = state.startRepeating({ finished: 1, total: 10 }, name);

        for (const rs of [rs2, rs1]) {
            // And get repeating with name
            const actual = state.getRepeatStateByName(name);

            // Then get second repeating
            expect(actual).toBe(rs);

            // finish repeating for next loop
            state.finishRepeating(rs, name);
        }
    });

    test('has initial repeating', () => {
        // Given Player
        const player = createPlayer();

        // And firing state
        const state = new FiringState(player);

        // When get current repeating
        const actual = state.getRepeatState(0);

        // Then get { finished: 0, total: 1 }
        const expected = { finished: 0, total: 1 };
        expect(actual).toEqual(expected);
    });

    test('throw error if finish repeating if repeating was completed', () => {
        // Given repeating state
        const repeatState: IRepeatState = { finished: 0, total: 10 };

        // And Player
        const player = createPlayer();

        // And firing state
        const state = new FiringState(player);

        // When start repeating
        state.startRepeating(repeatState);

        // And finish repeating
        state.finishRepeating(repeatState);

        // And finish repeating again
        // Then throw error
        expect(() => state.finishRepeating({ finished: 0, total: 10 })).toThrowError();
    });

    test('throw error when finish repeating if finishing repeating is not current repeating', () => {
        // Given repeating state
        const rs1: IRepeatState = { finished: 0, total: 10 };
        const rs2: IRepeatState = { finished: 1, total: 10 };

        // And Player
        const player = createPlayer();

        // And firing state
        const state = new FiringState(player);

        // When start repeating twice
        state.startRepeating(rs1);
        state.startRepeating(rs2);

        // And finish first repeating
        // Then throw error
        expect(() => state.finishRepeating(rs1)).toThrowError();
    });
});
