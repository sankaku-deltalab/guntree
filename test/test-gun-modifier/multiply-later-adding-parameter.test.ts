import { Parameter } from 'guntree/parameter';
import { IFiringState } from 'guntree/gun';
import { MultiplyLaterAddingParameter } from 'guntree/elements/gunModifier';
import { ILazyEvaluative } from 'guntree/lazyEvaluative';

describe('#MultiplyLaterAddingParameter', () => {
    test('can multiply later adding to parameter with constant number', () => {
        // Given FiringState
        const parameterClass = jest.fn<Parameter>(() => ({
            multiplyLaterAdding: jest.fn(),
        }));
        const parameterName = 'a';
        const parameter = new parameterClass();
        const firingStateClass = jest.fn<IFiringState>(() => ({
            parameters: new Map<string, Parameter>([[parameterName, parameter]]),
        }));
        const state = new firingStateClass();

        // And MultiplyLaterAddingParameter
        const multiplier = 2;
        const mlt = new MultiplyLaterAddingParameter(parameterName, multiplier);

        // When play MultiplyLaterAddingParameter with one frame
        const progress = mlt.play(state);
        const result = progress.next();

        // Then later adding was multiplied only once
        expect(parameter.multiplyLaterAdding).toBeCalledTimes(1);
        expect(parameter.multiplyLaterAdding).toBeCalledWith(multiplier);

        // And progress was finished
        expect(result.done).toBe(true);
    });

    test('can multiply later adding to parameter with lazyEvaluative', () => {
        // Given FiringState
        const parameterClass = jest.fn<Parameter>(() => ({
            multiplyLaterAdding: jest.fn(),
        }));
        const parameterName = 'a';
        const parameter = new parameterClass();
        const firingStateClass = jest.fn<IFiringState>(() => ({
            parameters: new Map<string, Parameter>([[parameterName, parameter]]),
        }));
        const state = new firingStateClass();

        // And lazyEvaluative
        const multiplier = 2;
        const leClass = jest.fn<ILazyEvaluative<number>>(() => ({
            calc: jest.fn().mockReturnValueOnce(multiplier),
        }));
        const le = new leClass();

        // And MultiplyLaterAddingParameter
        const mlt = new MultiplyLaterAddingParameter(parameterName, le);

        // When play MultiplyLaterAddingParameter with one frame
        const progress = mlt.play(state);
        const result = progress.next();

        // Then later adding was multiplied only once
        expect(parameter.multiplyLaterAdding).toBeCalledTimes(1);
        expect(parameter.multiplyLaterAdding).toBeCalledWith(multiplier);

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

        // And MultiplyLaterAddingParameter use another parameter name
        const multiplier = 2;
        const fatalParameterName = 'b';
        const mlt = new MultiplyLaterAddingParameter(fatalParameterName, multiplier);

        // When play MultiplyLaterAddingParameter with one frame
        const progress = mlt.play(state);

        // Then throw error
        expect(() => { progress.next(); }).toThrowError();
    });
});