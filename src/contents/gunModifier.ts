import * as mat from "transformation-matrix";

import {
  TConstantOrLazy,
  calcValueFromConstantOrLazy
} from "../lazyEvaluative";
import * as modO from "../elements/gunModifier";
import * as le from "../contents/lazyEvaluative";
import { VirtualMuzzleGenerator } from "../muzzle";
import { FiringState } from "../firing-state";

/**
 * Transform firing transformation matrix.
 *
 * @param trans transform.
 */
export const transform = (
  trans: TConstantOrLazy<mat.Matrix>
): modO.ModifierGun => {
  return new modO.ModifierGun(true, new modO.TransformModifier(trans));
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
}): modO.ModifierGun => {
  const transX = translation.x === undefined ? 0 : translation.x;
  const transY = translation.y === undefined ? 0 : translation.y;
  return transform(le.createTransform({ translation: [transX, transY] }));
};

/**
 * Define parameter.
 *
 * ```typescript
 * const dangerousFire = concat(
 *   useParameter('dangerousness', 9999),
 *   fire(bullet()),
 * );
 * ```
 *
 * @param name Parameter name.
 * @param value Initial parameter value.
 */
export const useParameter = (
  name: string,
  value: TConstantOrLazy<number>
): modO.ModifierGun => {
  return new modO.ModifierGun(
    false,
    new modO.SetParameterImmediatelyModifier(name, value)
  );
};

/**
 * Modify parameter.
 *
 * @param name Parameter name.
 * @param modifier Parameter modify function.
 */
export const modifyParameter = (
  name: string,
  modifier: (stateConst: FiringState, oldValue: number) => number
): modO.ModifierGun => {
  return new modO.ModifierGun(
    true,
    new modO.ModifyParameterModifier(name, modifier)
  );
};

/**
 * Use muzzle.
 * Every firing need muzzle.
 *
 * ```typescript
 * const firing = concat(
 *   useMuzzle('centerMuzzle'),
 *   fire(bullet()),
 * );
 * ```
 *
 * @param name Muzzle name
 */
export const useMuzzle = (name: TConstantOrLazy<string>): modO.ModifierGun => {
  return new modO.ModifierGun(
    false,
    new modO.SetMuzzleImmediatelyModifier(name)
  );
};

/**
 * Attach virtual muzzle to current muzzle.
 *
 * ```typescript
 * const aimingFireFromCenter = concat(
 *   useMuzzle('centerMuzzle'),
 *   useVirtualMuzzle(aimingMuzzle()),
 *   fire(bullet()),
 * );
 * ```
 *
 * @param virtualMuzzleGenerator Generate attaching virtual muzzle.
 */
export const useVirtualMuzzle = (
  virtualMuzzleGenerator: VirtualMuzzleGenerator
): modO.ModifierGun => {
  return new modO.ModifierGun(
    false,
    new modO.AttachVirtualMuzzleImmediatelyModifier(virtualMuzzleGenerator)
  );
};

/**
 * Define text.
 *
 * ```typescript
 * const dangerousFire = concat(
 *   useText('isDangerous', 'yes'),
 *   fire(bullet()),
 * );
 * ```
 *
 * @param name Text name.
 * @param text Initial text.
 */
export const useText = (
  name: string,
  text: TConstantOrLazy<string>
): modO.ModifierGun => {
  return new modO.ModifierGun(
    false,
    new modO.SetTextImmediatelyModifier(name, text)
  );
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
export const addAngle = (
  angleDeg: TConstantOrLazy<number>
): modO.ModifierGun => {
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
): modO.ModifierGun => {
  return modifyParameter(name, (stateConst, oldValue): number => {
    return oldValue + calcValueFromConstantOrLazy<number>(stateConst, adding);
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
 * @param adding Multiplier.
 */
export const mltParameter = (
  name: string,
  adding: TConstantOrLazy<number>
): modO.ModifierGun => {
  return modifyParameter(name, (stateConst, oldValue): number => {
    return oldValue * calcValueFromConstantOrLazy<number>(stateConst, adding);
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
): modO.ModifierGun => {
  return modifyParameter(name, (stateConst, _oldValue): number => {
    return calcValueFromConstantOrLazy<number>(stateConst, newValue);
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
export const addSpeed = (adding: TConstantOrLazy<number>): modO.ModifierGun =>
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
export const addSize = (adding: TConstantOrLazy<number>): modO.ModifierGun =>
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
export const addNWayAngle = (
  option: le.TAddNWayAngleOption
): modO.ModifierGun => addAngle(le.nWayAngle(option));

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
export const mltSpeed = (
  multiplier: TConstantOrLazy<number>
): modO.ModifierGun => mltParameter("speed", multiplier);

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
export const mltSize = (
  multiplier: TConstantOrLazy<number>
): modO.ModifierGun => mltParameter("size", multiplier);

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
export const resetSpeed = (
  newValue: TConstantOrLazy<number>
): modO.ModifierGun => resetParameter("speed", newValue);

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
export const resetSize = (
  newValue: TConstantOrLazy<number>
): modO.ModifierGun => resetParameter("size", newValue);

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
 *   invert({ angle: true, translationY: true }),
 *   leanFireFromRight,
 * );
 * ```
 *
 * @param newValue New value.
 */
export const invert = (
  option: modO.TInvertTransformOption
): modO.ModifierGun => {
  return new modO.ModifierGun(true, new modO.InvertTransformModifier(option));
};
