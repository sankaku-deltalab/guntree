import { range } from 'lodash';

import { IRepeatState, FiringState, IGun } from 'guntree/gun';
import { Parameter } from 'guntree/parameter';

/**
- 連射の記録
- 発砲の通知
- コピー
 */

describe('#FiringState', () => {
    test('can copy self', () => {
        // Given Parameter and clone
        const paramClass = jest.fn<Parameter>((cloned: Parameter) => ({
            copy: jest.fn().mockReturnValueOnce(cloned),
        }));
        const paramClone = new paramClass();
        const param = new paramClass(paramClone);

        // And firing state with parameter
        const paramName = 'a';
        const state = new FiringState();
        state.parameters.set(paramName, param);

        // When copy firing state
        const clone = state.copy();

        // Then clone has cloned parameter
        expect(clone.parameters.get(paramName)).toBe(paramClone);
    });

    test('can get current repeat state', () => {
        // Given repeating state
        const repeatState: IRepeatState = { finished: 0, total: 10 };

        // And firing state
        const state = new FiringState();

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

        // And firing state
        const state = new FiringState();

        // When start nested repeating
        for (const rs of repeatStates) {
            state.startRepeating(rs);
        }

        // And get repeat state
        const actual = state.getRepeatState(position);

        // Then dealt state is expected position's state
        expect(actual).toBe(repeatStates.reverse()[position]);
    });

    test('has initial repeating', () => {
        // Given firing state
        const state = new FiringState();

        // When get current repeating
        const actual = state.getRepeatState(0);

        // Then get { finished: 0, total: 1 }
        const expected = { finished: 0, total: 1 };
        expect(actual).toEqual(expected);
    });

    test('throw error if finish repeating if repeating was completed', () => {
        // Given repeating state
        const repeatState: IRepeatState = { finished: 0, total: 10 };

        // And firing state
        const state = new FiringState();

        // When start repeating
        state.startRepeating(repeatState);

        // And finish repeating
        state.finishRepeating(repeatState);

        // And finish repeating again
        // Then throw error
        expect(() => state.finishRepeating({ finished: 0, total: 10 })).toThrowError();
    });
});
