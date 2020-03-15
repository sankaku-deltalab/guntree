import * as mat from "transformation-matrix";
import { TConstantOrLazy, LazyEvaluative } from "../lazyEvaluative";
import * as leO from "../elements/lazy-evaluative";

/**
 * Linear interpolate.
 *
 * ```typescript
 * const leaningFire = repeat(
 *   { times: 10, interval: 3, name: 'masterRepeat' },
 *   addAngle(linear(0, 90, 'masterRepeat')),
 *   fire(bullet()),
 * );
 * ```
 *
 * @param start Initial value.
 * @param stop Stop value. Final value is not stop value (without when start = stop).
 * @param target Repeating name. When not specified target, use current repeating.
 */
export const linear = (
  start: TConstantOrLazy<number>,
  stop: TConstantOrLazy<number>,
  target?: string
): LazyEvaluative<number> => new leO.Linear(start, stop, target);

/**
 * Linear interpolate.
 * Values average is zero.
 *
 * @param totalRange Range. Can receive non-positive value.
 * @param target Repeating name. When not specified target, use current repeating.
 */
export const centerizedLinear = (
  totalRange: TConstantOrLazy<number>,
  target?: string
): LazyEvaluative<number> => new leO.CenterizedLinear(totalRange, target);

/**
 * Iterate input at each repeating.
 *
 * @param array Would be iterated values.
 * @param option Option.
 */
export const iterate = (
  array: TConstantOrLazy<number>[],
  option?: leO.TIterateOption
): LazyEvaluative<number> => new leO.Iterate(array, option);

/**
 * Round number to int.
 *
 * @param input number.
 */
export const round = (input: TConstantOrLazy<number>): LazyEvaluative<number> =>
  new leO.Round(input);

/**
 * Option for nWayAngle.
 */
export interface TNWayAngleOption {
  /** Total angle. */
  totalAngle: TConstantOrLazy<number>;
  /** Repeating name. When not specified target, use current repeating. */
  target?: string;
}

/**
 * Same of CenterizedLinear but argument is expressed as N-Way firing.
 *
 * @param option Option.
 */
export const nWayAngle = (option: TNWayAngleOption): LazyEvaluative<number> =>
  new leO.CenterizedLinear(option.totalAngle, option.target);

/**
 * Create transform.
 *
 * @param option Option.
 */
export const createTransform = (
  option: leO.TCreateTransformOption
): LazyEvaluative<mat.Matrix> => new leO.CreateTransform(option);
