import * as mat from "transformation-matrix";

import {
  TConstantOrLazy,
  calcValueFromConstantOrLazy
} from "../lazyEvaluative";
import * as modO from "../elements/gunModifier";
import * as le from "../contents/lazyEvaluative";
import { IVirtualMuzzleGenerator } from "../muzzle";
import { IFiringState } from "../firing-state";

/**
 * Transform matrix.
 */
export const transform = (
  trans: TConstantOrLazy<mat.Matrix>
): modO.ModifierGun => {
  return new modO.ModifierGun(true, new modO.TransformModifier(trans));
};

/**
 * Add translation.
 */
export const addTranslation = (
  translation: [TConstantOrLazy<number>, TConstantOrLazy<number>]
): modO.ModifierGun => {
  return transform(le.createTransform({ translation }));
};

/**
 * Set parameter in FireData when played.
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
 * Set parameter in FireData when played.
 */
export const modifyParameter = (
  name: string,
  modifier: (stateConst: IFiringState, oldValue: number) => number
): modO.ModifierGun => {
  return new modO.ModifierGun(
    true,
    new modO.ModifyParameterModifier(name, modifier)
  );
};

/**
 * Set muzzle in FireData when played.
 */
export const useMuzzle = (name: TConstantOrLazy<string>): modO.ModifierGun => {
  return new modO.ModifierGun(
    false,
    new modO.SetMuzzleImmediatelyModifier(name)
  );
};

/**
 * Attach virtual muzzle to current muzzle.
 */
export const useVirtualMuzzle = (
  virtualMuzzleGenerator: IVirtualMuzzleGenerator
): modO.ModifierGun => {
  return new modO.ModifierGun(
    false,
    new modO.AttachVirtualMuzzleImmediatelyModifier(virtualMuzzleGenerator)
  );
};

/**
 * Set text in FireData when played.
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

export const addAngle = (
  angleDeg: TConstantOrLazy<number>
): modO.ModifierGun => {
  return transform(le.createTransform({ rotationDeg: angleDeg }));
};

export const addParameter = (
  name: string,
  adding: TConstantOrLazy<number>
): modO.ModifierGun => {
  return modifyParameter(name, (stateConst, oldValue) => {
    return oldValue + calcValueFromConstantOrLazy<number>(stateConst, adding);
  });
};

export const mltParameter = (
  name: string,
  adding: TConstantOrLazy<number>
): modO.ModifierGun => {
  return modifyParameter(
    name,
    (stateConst, oldValue): number => {
      return oldValue * calcValueFromConstantOrLazy<number>(stateConst, adding);
    }
  );
};

export const resetParameter = (
  name: string,
  newValue: TConstantOrLazy<number>
): modO.ModifierGun => {
  return modifyParameter(
    name,
    (stateConst, oldValue): number => {
      return calcValueFromConstantOrLazy<number>(stateConst, newValue);
    }
  );
};

export const addSpeed = (adding: TConstantOrLazy<number>): modO.ModifierGun =>
  addParameter("speed", adding);
export const addSize = (adding: TConstantOrLazy<number>): modO.ModifierGun =>
  addParameter("size", adding);
export const addNWayAngle = (
  option: le.TAddNWayAngleOption
): modO.ModifierGun => addAngle(le.nWayAngle(option));

export const mltSpeed = (
  multiplier: TConstantOrLazy<number>
): modO.ModifierGun => mltParameter("speed", multiplier);
export const mltSize = (
  multiplier: TConstantOrLazy<number>
): modO.ModifierGun => mltParameter("size", multiplier);

export const resetSpeed = (
  newValue: TConstantOrLazy<number>
): modO.ModifierGun => resetParameter("speed", newValue);
export const resetSize = (
  newValue: TConstantOrLazy<number>
): modO.ModifierGun => resetParameter("size", newValue);

export const invert = (
  option: modO.TInvertTransformOption
): modO.ModifierGun => {
  return new modO.ModifierGun(true, new modO.InvertTransformModifier(option));
};
