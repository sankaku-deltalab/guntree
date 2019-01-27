import { IFiringState } from 'guntree/firing-state';
import { SetParameterImmediately } from 'guntree/elements/gunModifer';
import { ILazyEvaluative } from 'guntree/lazyEvaluative';

describe('#SetParameterImmediately', () => {
    test('can set value with unset name', () => {
        // Given firing state
        const stateClass = jest.fn<IFiringState>(() => ({
            fireData: { parameters: new Map() },
        }));
        const state = new stateClass();

        // And SetParameterImmediately
        const name = 'a';
        const value = 1;
        const setParameter = new SetParameterImmediately(name, value);

        // When play SetParameterImmediately
        setParameter.play(state).next();

        // Then parameter was set
        expect(state.fireData.parameters.get(name)).toBeCloseTo(value);
    });

    test('can set value with already set name', () => {
        // Given firing state
        const name = 'a';
        const value = 1;
        const stateClass = jest.fn<IFiringState>(() => ({
            fireData: { parameters: new Map([[name, value + 1]]) },
        }));
        const state = new stateClass();

        // And SetParameterImmediately
        const setParameter = new SetParameterImmediately(name, value);

        // When play SetParameterImmediately
        setParameter.play(state).next();

        // Then parameter was set
        expect(state.fireData.parameters.get(name)).toBeCloseTo(value);
    });

    test('can set value with lazyEvaluative value', () => {
        // Given firing state
        const stateClass = jest.fn<IFiringState>(() => ({
            fireData: { parameters: new Map() },
        }));
        const state = new stateClass();

        // And SetParameterImmediately
        const leClass = jest.fn<ILazyEvaluative<number>>((v: number) => ({
            calc: jest.fn().mockReturnValueOnce(v),
        }));
        const name = 'a';
        const value = 1;
        const valueLe = new leClass(value);
        const setParameter = new SetParameterImmediately(name, valueLe);

        // When play SetParameterImmediately
        setParameter.play(state).next();

        // Then parameter was set
        expect(state.fireData.parameters.get(name)).toBeCloseTo(value);
    });
});
