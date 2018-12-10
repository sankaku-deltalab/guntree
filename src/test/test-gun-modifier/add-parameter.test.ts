import { Parameter } from 'guntree/parameter';
import { IFiringState } from 'guntree/gun';
import { AddParameter } from 'guntree/gun-modifier';
import { ILazyEvaluative } from 'guntree/lazy-evaluative';

describe('#AddParameter', () => {
    test('can add parameter with constant number', () => {
        // Given FiringState
        const parameterClass = jest.fn<Parameter>(() => ({
            add: jest.fn(),
        }));
        const parameterName = 'a';
        const parameter = new parameterClass();
        const firingStateClass = jest.fn<IFiringState>(() => ({
            parameters: new Map<string, Parameter>([[parameterName, parameter]]),
        }));
        const state = new firingStateClass();

        // And AddParameter
        const adding = 2;
        const add = new AddParameter(parameterName, adding);

        // When play AddParameter with one frame
        const progress = add.play(state);
        const result = progress.next();

        // Then parameter has added only once
        expect(parameter.add).toBeCalledTimes(1);
        expect(parameter.add).toBeCalledWith(adding);

        // And progress was finished
        expect(result.done).toBe(true);
    });

    test('can add parameter with lazy-evaluative', () => {
        // Given FiringState
        const parameterClass = jest.fn<Parameter>(() => ({
            add: jest.fn(),
        }));
        const parameterName = 'a';
        const parameter = new parameterClass();
        const firingStateClass = jest.fn<IFiringState>(() => ({
            parameters: new Map<string, Parameter>([[parameterName, parameter]]),
        }));
        const state = new firingStateClass();

        // And lazy-evaluative
        const adding = 2;
        const leClass = jest.fn<ILazyEvaluative<number>>(() => ({
            calc: jest.fn().mockReturnValueOnce(adding),
        }));
        const le = new leClass();

        // And AddParameter
        const add = new AddParameter(parameterName, le);

        // When play AddParameter with one frame
        const progress = add.play(state);
        const result = progress.next();

        // Then parameter has added only once
        expect(parameter.add).toBeCalledTimes(1);
        expect(parameter.add).toBeCalledWith(adding);

        // And progress was finished
        expect(result.done).toBe(true);
    });

    test('throw error if parameter is not exist', () => {
        // Given FiringState
        const parameterClass = jest.fn<Parameter>(() => ({
            add: jest.fn(),
        }));
        const parameterName = 'a';
        const parameter = new parameterClass();
        const firingStateClass = jest.fn<IFiringState>(() => ({
            parameters: new Map<string, Parameter>([[parameterName, parameter]]),
        }));
        const state = new firingStateClass();

        // And AddParameter use another parameter name
        const adding = 2;
        const fatalParameterName = 'b';
        const add = new AddParameter(fatalParameterName, adding);

        // When play AddParameter with one frame
        const progress = add.play(state);

        // Then throw error
        expect(() => { progress.next(); }).toThrowError();
    });
});
