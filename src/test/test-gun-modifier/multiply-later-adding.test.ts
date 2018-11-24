import { Parameter } from 'guntree/parameter';
import { IFiringState } from 'guntree/gun';
import { MultiplyLaterAdding } from 'guntree/gun-modifier';
import { ILazyEvaluative } from 'guntree/lazy-evaluative';

describe('#MultiplyLaterAdding', () => {
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

        // And MultiplyLaterAdding
        const multiplier = 2;
        const mlt = new MultiplyLaterAdding(parameterName, multiplier);

        // When play MultiplyLaterAdding with one frame
        const progress = mlt.play(state);
        const result = progress.next();

        // Then later adding was multiplied only once
        expect(parameter.multiplyLaterAdding).toBeCalledTimes(1);
        expect(parameter.multiplyLaterAdding).toBeCalledWith(multiplier);

        // And progress was finished
        expect(result.done).toBe(true);
    });

    test('can multiply later adding to parameter with lazy-evaluative', () => {
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

        // And lazy-evaluative
        const multiplier = 2;
        const leClass = jest.fn<ILazyEvaluative<number>>(() => ({
            calc: jest.fn().mockReturnValueOnce(multiplier),
        }));
        const le = new leClass();

        // And MultiplyLaterAdding
        const mlt = new MultiplyLaterAdding(parameterName, le);

        // When play MultiplyLaterAdding with one frame
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

        // And MultiplyLaterAdding use another parameter name
        const multiplier = 2;
        const fatalParameterName = 'b';
        const mlt = new MultiplyLaterAdding(fatalParameterName, multiplier);

        // When play MultiplyLaterAdding with one frame
        const progress = mlt.play(state);

        // Then throw error
        expect(() => { progress.next(); }).toThrowError();
    });
});
