import * as mat from 'transformation-matrix';

import { decomposeTransform } from 'guntree/transform-util';

describe('#decomposeTransform', () => {
    test('can decompose transform', () => {
        // Given transform matrix has translate, rotateDeg and scale.
        const translate = { x: 1.1, y: 5.2 };
        const rotateDeg = 13.3;
        const scale = { x: 0.4, y: 4.5 };
        const trans = mat.transform(
            mat.translate(translate.x, translate.y),
            mat.rotateDEG(rotateDeg),
            mat.scale(scale.x, scale.y),
        );

        // When decompose trans
        const [t, r, s] = decomposeTransform(trans);

        // Then get original elements
        expect(t.x).toBeCloseTo(translate.x);
        expect(t.y).toBeCloseTo(translate.y);
        expect(r).toBeCloseTo(rotateDeg);
        expect(s.x).toBeCloseTo(scale.x);
        expect(s.y).toBeCloseTo(scale.y);
    });
});
