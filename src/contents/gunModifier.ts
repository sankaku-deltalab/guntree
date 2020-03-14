import * as mat from "transformation-matrix";

import {
  TConstantOrLazy,
  calcValueFromConstantOrLazy
} from "../lazyEvaluative";
import * as modO from "../elements/gunModifier";
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
 *   addTranslation({ y: 0.1 }),
 *   fire(bullet()),
 * );
 * ```
 *
 * @param translation Added translation as [x, y].
 */
export const addTranslation = (translation: {
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
export const modifyParameter = (
  name: string,
  modifier: (state: FiringState) => (oldValue: number) => number
): Gun => {
  return new modO.ModifierGun(new modO.ModifyParameterModifier(name, modifier));
};

/**
 * Add firing angle.
 *
 * ```typescript
 * const leanFire = concat(
 *   addAngle(45),
 *   fire(bullet()),
 * );
 * ```
 *
 * @param angleDeg Adding angle degrees.
 */
export const addAngle = (angleDeg: TConstantOrLazy<number>): Gun => {
  return transform(le.createTransform({ rotationDeg: angleDeg }));
};

/**
 * Add parameter.
 *
 * ```typescript
 * const moreDangerousFire = concat(
 *   useParameter('dangerousness', 9999),
 *   addParameter('dangerousness', 10),
 *   fire(bullet()),
 * );
 * ```
 *
 * @param name Parameter name.
 * @param adding Adding amount.
 */
export const addParameter = (
  name: string,
  adding: TConstantOrLazy<number>
): Gun => {
  return modifyParameter(name, state => {
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
 *   mltParameter('dangerousness', 0),
 *   fire(bullet()),
 * );
 * ```
 *
 * @param name Parameter name.
 * @param multiplier Multiplier.
 */
export const mltParameter = (
  name: string,
  multiplier: TConstantOrLazy<number>
): Gun => {
  return modifyParameter(name, state => {
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
export const resetParameter = (
  name: string,
  newValue: TConstantOrLazy<number>
): Gun => {
  return modifyParameter(name, state => {
    const valueConst = calcValueFromConstantOrLazy<number>(state, newValue);
    return (): number => valueConst;
  });
};

/**
 * Add bullet speed.
 *
 * ```typescript
 * const doubleSpeedFire = concat(
 *   addSpeed(1),
 *   fire(bullet()),
 * );
 * ```
 *
 * @param adding Adding speed.
 */
export const addSpeed = (adding: TConstantOrLazy<number>): Gun =>
  addParameter("speed", adding);

/**
 * Add bullet size.
 *
 * ```typescript
 * const doubleSizedFire = concat(
 *   addSpeed(1),
 *   fire(bullet()),
 * );
 * ```
 *
 * @param adding Adding size.
 */
export const addSize = (adding: TConstantOrLazy<number>): Gun =>
  addParameter("size", adding);

/**
 * Add angle like N-Way firing.
 *
 * ```typescript
 * const firing = repeat(
 *   { times: 5, interval: 10, name: 'masterRepeat'},
 *   addNWayAngle({ totalAngle: 90, name: 'masterRepeat'})
 *   fire(bullet()),
 * );
 * ```
 *
 * @param option N-Way firing option.
 */
export const addNWayAngle = (option: le.TAddNWayAngleOption): Gun =>
  addAngle(le.nWayAngle(option));

/**
 * Multiply bullet speed.
 *
 * ```typescript
 * const doubleSpeedFire = concat(
 *   mltSpeed(2),
 *   fire(bullet()),
 * );
 * ```
 *
 * @param multiplier Multiplier.
 */
export const mltSpeed = (multiplier: TConstantOrLazy<number>): Gun =>
  mltParameter("speed", multiplier);

/**
 * Multiply bullet size.
 *
 * ```typescript
 * const doubleSizedFire = concat(
 *   mltSize(2),
 *   fire(bullet()),
 * );
 * ```
 *
 * @param multiplier Multiplier.
 */
export const mltSize = (multiplier: TConstantOrLazy<number>): Gun =>
  mltParameter("size", multiplier);

/**
 * Reset bullet speed.
 *
 * ```typescript
 * const doubleSpeedFire = concat(
 *   resetSpeed(2),
 *   fire(bullet()),
 * );
 * ```
 *
 * @param newValue New value.
 */
export const resetSpeed = (newValue: TConstantOrLazy<number>): Gun =>
  resetParameter("speed", newValue);

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
export const resetSize = (newValue: TConstantOrLazy<number>): Gun =>
  resetParameter("size", newValue);

/**
 * Invert angle and translation.
 *
 * ```typescript
 * const leanFireFromRight = concat(
 *   addTranslation({ x: 0, y: 0.2 }),
 *   addAngle(45),
 *   fire(bullet()),
 * );
 * const invertedFire = concat(
 *   invert(),
 *   leanFireFromRight,
 * );
 * ```
 *
 * @param newValue New value.
 */
export const invert = (): Gun => {
  return new modO.ModifierGun(new modO.InvertTransformModifier());
};
