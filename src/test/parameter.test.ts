import { Parameter } from 'guntree/parameter';

describe('#Parameter', () => {
    test('can set initial value', () => {
        // Given initial value
        const initialValue = 123;

        // When create parameter
        const parameter = new Parameter(initialValue);

        // Then parameter has initial value
        expect(parameter.calcValue()).toBe(initialValue);
    });
});
