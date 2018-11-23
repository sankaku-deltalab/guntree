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

    test('can add value', () => {
        // Given parameter
        const initialValue = 123;
        const parameter = new Parameter(initialValue);

        // When add parameter
        const adding = 32;
        parameter.add(adding);

        // Then parameter was added
        expect(parameter.calcValue()).toBe(initialValue + adding);
    });

    test('can add value with multiplier', () => {
        // Given parameter
        const initialValue = 123;
        const parameter = new Parameter(initialValue);

        // When update adding multiplier
        const mlt = 1.2;
        parameter.multiplyLaterAdding(mlt);

        // And add parameter twice
        const adding = [32, 54];
        for (const a of adding) {
            const added = parameter.add(a);

            // Then added value was multiplier
            expect(added).toBeCloseTo(a * mlt);
        }

        // Then parameter was added with multiplier
        expect(parameter.calcValue()).toBeCloseTo(initialValue + (adding[0] + adding[1]) * mlt);
    });
});
