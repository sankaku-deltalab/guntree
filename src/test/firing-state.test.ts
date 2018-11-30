import { FiringState, IGun } from 'guntree/gun';
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
});
