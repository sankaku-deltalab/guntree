import * as mat from 'transformation-matrix';

/**
 * Decompose transformation matrix to translate, rotationDeg and scale.
 *
 * @param trans Decomposing transformation matrix.
 */
export const decomposeTransform = (trans: mat.Matrix): [mat.Point, number, mat.Point] => {
    const loc = { x: trans.e, y: trans.f };
    const scaleX = Math.sqrt(trans.a ** 2 + trans.b ** 2);
    const scaleY = Math.sqrt(trans.c ** 2 + trans.d ** 2);
    const scale = { x: scaleX, y: scaleY };
    const angleRad = Math.acos(trans.a / scaleX);
    const angleDeg = angleRad * 180 / Math.PI;
    return [loc, angleDeg, scale];
};
