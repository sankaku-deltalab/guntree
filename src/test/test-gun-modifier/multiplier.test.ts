import { Parameter } from 'guntree/parameter';
import { IFiringState } from 'guntree/gun';
import { MultiplyParameter } from 'guntree/gun-modifier';
import { ILazyEvaluative } from 'guntree/lazy-evaluative';

describe('#MultiplyParameter', () => {
    test('can multiply parameter with constant number', () => {
        // Given FiringState
        const parameterClass = jest.fn<Parameter>(() => ({
            multiply: jest.fn(),
        }));
        const parameterName = 'a';
        const parameter = new parameterClass();
        const firingStateClass = jest.fn<IFiringState>(() => ({
            parameters: new Map<string, Parameter>([[parameterName, parameter]]),
        }));
        const state = new firingStateClass();

        // And MultiplyParameter
        const multiplier = 2;
        const mlt = new MultiplyParameter(parameterName, multiplier);

        // When play MultiplyParameter with one frame
        const progress = mlt.play(state);
        const result = progress.next();

        // Then parameter has multiplied only once
        expect(parameter.multiply).toBeCalledTimes(1);
        expect(parameter.multiply).toBeCalledWith(multiplier);

        // And progress was finished
        expect(result.done).toBe(true);
    });

    test('can multiply parameter with lazy-evaluative', () => {
        // Given FiringState
        const parameterClass = jest.fn<Parameter>(() => ({
            multiply: jest.fn(),
        }));
        const parameterName = 'a';
        const parameter = new parameterClass();
        const firingStateClass = jest.fn<IFiringState>(() => ({
            parameters: new Map<string, Parameter>([[parameterName, parameter]]),
        }));
        const state = new firingStateClass();

        // And lazy-evaluative
        const multiplier = 2;
        const leClass = jest.fn<ILazyEvaluative<number>>(() => ({
            calc: jest.fn().mockReturnValueOnce(multiplier),
        }));
        const le = new leClass();

        // And MultiplyParameter
        const mlt = new MultiplyParameter(parameterName, le);

        // When play MultiplyParameter with one frame
        const progress = mlt.play(state);
        const result = progress.next();

        // Then parameter has multiplied only once
        expect(parameter.multiply).toBeCalledTimes(1);
        expect(parameter.multiply).toBeCalledWith(multiplier);

        // And progress was finished
        expect(result.done).toBe(true);
    });

    test('throw error if parameter is not exist', () => {
        // Given FiringState
        const parameterClass = jest.fn<Parameter>(() => ({
            multiply: jest.fn(),
        }));
        const parameterName = 'a';
        const parameter = new parameterClass();
        const firingStateClass = jest.fn<IFiringState>(() => ({
            parameters: new Map<string, Parameter>([[parameterName, parameter]]),
        }));
        const state = new firingStateClass();

        // And MultiplyParameter use another parameter name
        const multiplier = 2;
        const fatalParameterName = 'b';
        const mlt = new MultiplyParameter(fatalParameterName, multiplier);

        // When play MultiplyParameter with one frame
        const progress = mlt.play(state);

        // Then throw error
        expect(() => { progress.next(); }).toThrowError();
    });
});
