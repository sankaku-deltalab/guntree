import * as mat from "transformation-matrix";
import { Vector } from "./interface";

// https://www.npmjs.com/package/transformation-matrix#data-model
// const matrix = { a: 1, c: 0, e: 0,
//                  b: 0, d: 1, f: 0 }

/**
 * Decompose transformation matrix to translate, rotationDeg and scale.
 *
 * @param trans Decomposing transformation matrix.
 */
export const decomposeTransform = (
  trans: mat.Matrix
): [Vector, number, Vector] => {
  const loc = { x: trans.e, y: trans.f };
  const scaleX = Math.sqrt(trans.a ** 2 + trans.b ** 2);
  const scaleY = Math.sqrt(trans.c ** 2 + trans.d ** 2);
  const scale = { x: scaleX, y: scaleY };
  const angleRad = Math.atan2(trans.b, trans.a);
  const angleDeg = (angleRad * 180) / Math.PI;
  return [loc, angleDeg, scale];
};
