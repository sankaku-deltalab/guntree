import { Parameter } from 'guntree/parameter';
import { IFiringState } from 'guntree/gun';
import { Add } from 'guntree/gun-modifier';

describe('#Add', () => {
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

        // And Add
        const adding = 2;
        const add = new Add(parameterName, adding);

        // When play Add with one frame
        const progress = add.play(state);
        const result = progress.next();

        // Then parameter has added only once
        expect(parameter.add).toBeCalledTimes(1);
        expect(parameter.add).toBeCalledWith(adding);

        // And progress was finished
        expect(result.done).toBe(true);
    });
});
