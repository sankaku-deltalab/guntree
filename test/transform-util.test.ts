import * as mat from 'transformation-matrix';

import { decomposeTransform } from 'guntree/transform-util';

const normalizeAngleDeg = (angleDeg: number) => {
    let r = angleDeg;
    while (r >= 180) {
        r -= 360;
    }
    while (r < -180) {
        r += 360;
    }
    return r;
};

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

    test.each`
    angleDeg
    ${0}
    ${0.1}
    ${1}
    ${13}
    ${45}
    ${90}
    ${160}
    ${180}
    ${-13}
    ${-45}
    ${-90}
    ${-160}
    ${-180}
    `('can decompose angle $angleDeg', ({ angleDeg }) => {
        // Given transform matrix has rotateDeg
        const trans = mat.transform(
            mat.rotateDEG(angleDeg),
        );

        // When decompose trans
        const [_, r, __] = decomposeTransform(trans);

        // Then get original angle
        expect(normalizeAngleDeg(r)).toBeCloseTo(normalizeAngleDeg(angleDeg));
    });

});
