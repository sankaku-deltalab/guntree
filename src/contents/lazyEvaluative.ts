import { TConstantOrLazy } from "../lazyEvaluative";
import * as leO from "../elements/lazyEvaluative";

export const linear = (
  start: TConstantOrLazy<number>,
  stop: TConstantOrLazy<number>,
  target?: string
): leO.Linear => new leO.Linear(start, stop, target);

export const centerizedLinear = (
  totalRange: TConstantOrLazy<number>,
  target?: string
): leO.CenterizedLinear => new leO.CenterizedLinear(totalRange, target);

export const iterate = (
  array: (TConstantOrLazy<number>)[],
  option?: leO.TIterateOption
): leO.Iterate => new leO.Iterate(array, option);

export const round = (input: TConstantOrLazy<number>): leO.Round =>
  new leO.Round(input);

/**
 * Option for nWayAngle.
 */
export interface TAddNWayAngleOption {
  /** Total angle. */
  totalAngle: TConstantOrLazy<number>;
  /** Repeating name. */
  name?: string;
}

export const nWayAngle = (option: TAddNWayAngleOption): leO.CenterizedLinear =>
  new leO.CenterizedLinear(option.totalAngle, option.name);

export const createTransform = (
  option: leO.TCreateTransformOption
): leO.CreateTransform => new leO.CreateTransform(option);
