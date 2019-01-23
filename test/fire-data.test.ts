import * as mat from 'transformation-matrix';

import { FireData } from 'guntree/gun';

describe('#FireData', () => {
    test('can copy self with transform', () => {
        // Given FireData
        const fd = new FireData();

        // And transform was set in FireData
        fd.transform = mat.translate(30);

        // When copy FireData
        const clone = fd.copy();

        // Then copy's transform is equal to original
        expect(clone.transform).toEqual(fd.transform);
        // And copy's transform is not same object with original
        expect(clone.transform).not.toBe(fd.transform);
    });

    test('can copy self with transform', () => {
        // Given FireData
        const fd = new FireData();

        // And parameters was set in FireData
        fd.parameters = new Map([
            ['a', 0],
            ['b', -1],
            ['1', 1.5],
        ]);

        // When copy FireData
        const clone = fd.copy();

        // Then copy's parameters is equal to original
        expect(clone.parameters).toEqual(fd.parameters);
        // And copy's parameters is not same object with original
        expect(clone.parameters).not.toBe(fd.parameters);
    });

    test('can copy self with transform', () => {
        // Given FireData
        const fd = new FireData();

        // And texts was set in FireData
        fd.texts = new Map([
            ['a', '123'],
            ['b', 'wqr'],
            ['1', ''],
        ]);

        // When copy FireData
        const clone = fd.copy();

        // Then copy's texts is equal to original
        expect(clone.texts).toEqual(fd.texts);
        // And copy's texts is not same object with original
        expect(clone.texts).not.toBe(fd.texts);
    });
});
