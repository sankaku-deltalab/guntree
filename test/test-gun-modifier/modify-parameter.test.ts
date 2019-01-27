import { IFiringState, FiringState, IFireData } from 'guntree/firing-state';
import { ModifyParameter } from 'guntree/elements/gunModifer';
import { IPlayer } from 'guntree/player';

describe('#ModifyParameter', () => {
    test('modify already set parameter', () => {
        // Given firing state
        const name = 'a';
        const initialValue = 1;
        const stateClass = jest.fn<IFiringState>(() => ({
            fireData: { parameters: new Map([[name, initialValue]]) },
            pushModifier: jest.fn(),
        }));
        const state = new stateClass();

        // And ModifyParameter
        const value = 2;
        const modifier = jest.fn().mockReturnValueOnce(value);
        const modParam = new ModifyParameter(name, modifier);

        // When play SetParameterImmediately
        modParam.play(state).next();

        // Then modifier was pushed to FiringState
        expect(state.pushModifier).toBeCalledTimes(1);
    });

    test('can not set unset parameter', () => {
        // Given firing state
        const state = new FiringState(new (jest.fn<IPlayer>()));

        // And ModifyParameter
        const name = 'a';
        const value = 2;
        const modifier = jest.fn().mockReturnValueOnce(value);
        const modParam = new ModifyParameter(name, modifier);

        // When play SetParameterImmediately
        modParam.play(state).next();

        // And calcModifiedFireData
        const calc = () => state.calcModifiedFireData();

        // Then throw
        expect(calc).toThrowError();
    });
});
