import { Parameter } from 'guntree/parameter';
import { IFiringState } from 'guntree/gun';
import { ResetParameter } from 'guntree/contents/gun-modifier';
import { ILazyEvaluative } from 'guntree/lazy-evaluative';

describe('#ResetParameter', () => {
    test('can reset parameter with constant number', () => {
        // Given FiringState
        const parameterClass = jest.fn<Parameter>(() => ({
            reset: jest.fn(),
        }));
        const parameterName = 'a';
        const parameter = new parameterClass();
        const firingStateClass = jest.fn<IFiringState>(() => ({
            parameters: new Map<string, Parameter>([[parameterName, parameter]]),
        }));
        const state = new firingStateClass();

        // And ResetParameter
        const newValue = 2;
        const reset = new ResetParameter(parameterName, newValue);

        // When play ResetParameter with one frame
        const progress = reset.play(state);
        const result = progress.next();

        // Then value was reset only once
        expect(parameter.reset).toBeCalledTimes(1);
        expect(parameter.reset).toBeCalledWith(newValue);

        // And progress was finished
        expect(result.done).toBe(true);
    });

    test('can reset parameter with lazy-evaluative', () => {
        // Given FiringState
        const parameterClass = jest.fn<Parameter>(() => ({
            reset: jest.fn(),
        }));
        const parameterName = 'a';
        const parameter = new parameterClass();
        const firingStateClass = jest.fn<IFiringState>(() => ({
            parameters: new Map<string, Parameter>([[parameterName, parameter]]),
        }));
        const state = new firingStateClass();

        // And lazy-evaluative
        const newValue = 2;
        const leClass = jest.fn<ILazyEvaluative<number>>(() => ({
            calc: jest.fn().mockReturnValueOnce(newValue),
        }));
        const le = new leClass();

        // And ResetParameter
        const reset = new ResetParameter(parameterName, le);

        // When play ResetParameter with one frame
        const progress = reset.play(state);
        const result = progress.next();

        // Then value was reset only once
        expect(parameter.reset).toBeCalledTimes(1);
        expect(parameter.reset).toBeCalledWith(newValue);

        // And progress was finished
        expect(result.done).toBe(true);
    });

    test('throw error if parameter is not exist', () => {
        // Given FiringState
        const parameterClass = jest.fn<Parameter>(() => ({
            reset: jest.fn(),
        }));
        const parameterName = 'a';
        const parameter = new parameterClass();
        const firingStateClass = jest.fn<IFiringState>(() => ({
            parameters: new Map<string, Parameter>([[parameterName, parameter]]),
        }));
        const state = new firingStateClass();

        // And ResetParameter use another parameter name
        const newValue = 2;
        const fatalParameterName = 'b';
        const reset = new ResetParameter(fatalParameterName, newValue);

        // When play ResetParameter with one frame
        const progress = reset.play(state);

        // Then throw error
        expect(() => { progress.next(); }).toThrowError();
    });
});
