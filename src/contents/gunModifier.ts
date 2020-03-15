import * as mat from "transformation-matrix";

import {
  TConstantOrLazy,
  calcValueFromConstantOrLazy
} from "../lazyEvaluative";
import * as modO from "../elements/modifier-gun";
import { Gun } from "../gun";
import * as le from "../contents/lazyEvaluative";
import { FiringState } from "guntree/firing-state";

/**
 * Transform firing transformation matrix.
 *
 * @param trans transform.
 */
export const transform = (trans: TConstantOrLazy<mat.Matrix>): Gun => {
  return new modO.ModifierGun(new modO.TransformModifier(trans));
};

/**
 * Add fire translation.
 *
 * ```typescript
 * const fireFromRight = concat(
 *   translationAdded({ y: 0.1 }),
 *   fire(bullet()),
 * );
 * ```
 *
 * @param translation Added translation as [x, y].
 */
export const translationAdded = (translation: {
  x?: TConstantOrLazy<number>;
  y?: TConstantOrLazy<number>;
}): Gun => {
  const transX = translation.x === undefined ? 0 : translation.x;
  const transY = translation.y === undefined ? 0 : translation.y;
  return transform(le.createTransform({ translation: [transX, transY] }));
};

/**
 * Modify parameter.
 *
 * @param name Parameter name.
 * @param modifier Parameter modify function.
 */
export const paramModified = (
  name: string,
  modifier: (state: FiringState) => (oldValue: number) => number
): Gun => {
  return new modO.ModifierGun(new modO.ModifyParameterModifier(name, modifier));
};

/**
 * Rotate firing transform.
 *
 * ```typescript
 * const leanFire = concat(
 *   rotated(45),
 *   translationAdded({ x: 0.1 }),
 *   fire(bullet()),
 * );
 * ```
 *
 * @param angleDeg Adding angle degrees.
 */
export const rotated = (angleDeg: TConstantOrLazy<number>): Gun => {
  return transform(le.createTransform({ rotationDeg: angleDeg }));
};

/**
 * Add parameter.
 *
 * ```typescript
 * const moreDangerousFire = concat(
 *   useParameter('dangerousness', 9999),
 *   paramAdded('dangerousness', 10),
 *   fire(bullet()),
 * );
 * ```
 *
 * @param name Parameter name.
 * @param adding Adding amount.
 */
export const paramAdded = (
  name: string,
  adding: TConstantOrLazy<number>
): Gun => {
  return paramModified(name, state => {
    const addingConst = calcValueFromConstantOrLazy<number>(state, adding);
    return (oldValue): number => oldValue + addingConst;
  });
};

/**
 * Multiply parameter.
 *
 * ```typescript
 * const zeroDangerousFire = concat(
 *   useParameter('dangerousness', 9999),
 *   parameterMultiplied('dangerousness', 0),
 *   fire(bullet()),
 * );
 * ```
 *
 * @param name Parameter name.
 * @param multiplier Multiplier.
 */
export const paramMultiplied = (
  name: string,
  multiplier: TConstantOrLazy<number>
): Gun => {
  return paramModified(name, state => {
    const mltConst = calcValueFromConstantOrLazy<number>(state, multiplier);
    return (oldValue): number => oldValue * mltConst;
  });
};

/**
 * Reset parameter value.
 *
 * ```typescript
 * const zeroDangerousFire = concat(
 *   useParameter('dangerousness', 9999),
 *   resetParameter('dangerousness', 0),
 *   fire(bullet()),
 * );
 * ```
 *
 * @param name Parameter name.
 * @param newValue New parameter value.
 */
export const paramReset = (
  name: string,
  newValue: TConstantOrLazy<number>
): Gun => {
  return paramModified(name, state => {
    const valueConst = calcValueFromConstantOrLazy<number>(state, newValue);
    return (): number => valueConst;
  });
};

/**
 * Add angle like N-Way firing.
 *
 * ```typescript
 * const firing = repeat(
 *   { times: 5, interval: 10, name: 'masterRepeat'},
 *   rotatedAsNWay({ totalAngle: 90, name: 'masterRepeat'}),
 *   fire(bullet()),
 * );
 * ```
 *
 * @param option N-Way firing option.
 */
export const rotatedAsNWay = (option: le.TNWayAngleOption): Gun =>
  rotated(le.nWayAngle(option));

/**
 * Multiply bullet speed.
 *
 * ```typescript
 * const doubleSpeedFire = concat(
 *   speedMultiplied(2),
 *   fire(bullet()),
 * );
 * ```
 *
 * @param multiplier Multiplier.
 */
export const speedMultiplied = (multiplier: TConstantOrLazy<number>): Gun =>
  paramMultiplied("speed", multiplier);

/**
 * Multiply bullet size.
 *
 * ```typescript
 * const doubleSizedFire = concat(
 *   sizeMultiplied(2),
 *   fire(bullet()),
 * );
 * ```
 *
 * @param multiplier Multiplier.
 */
export const sizeMultiplied = (multiplier: TConstantOrLazy<number>): Gun =>
  paramMultiplied("size", multiplier);

/**
 * Reset bullet speed.
 *
 * ```typescript
 * const doubleSpeedFire = concat(
 *   speedReset(2),
 *   fire(bullet()),
 * );
 * ```
 *
 * @param newValue New value.
 */
export const speedReset = (newValue: TConstantOrLazy<number>): Gun =>
  paramReset("speed", newValue);

/**
 * Reset bullet size.
 *
 * ```typescript
 * const doubleSizedFire = concat(
 *   resetSize(2),
 *   fire(bullet()),
 * );
 * ```
 *
 * @param newValue New value.
 */
export const sizeReset = (newValue: TConstantOrLazy<number>): Gun =>
  paramReset("size", newValue);

/**
 * Invert angle and translation.
 *
 * ```typescript
 * const leanFireFromRight = concat(
 *   translationAdded({ x: 0, y: 0.2 }),
 *   rotated(45),
 *   fire(bullet()),
 * );
 * const invertedFire = concat(
 *   inverted(),
 *   leanFireFromRight,
 * );
 * ```
 *
 * @param newValue New value.
 */
export const inverted = (): Gun => {
  return new modO.ModifierGun(new modO.InvertTransformModifier());
};
