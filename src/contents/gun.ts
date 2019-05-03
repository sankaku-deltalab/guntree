import { Gun } from "../gun";
import { Bullet } from "../bullet";
import { TConstantOrLazy } from "../lazyEvaluative";
import * as gunO from "../elements/gun";
import * as mod from "./gunModifier";
import * as le from "./lazyEvaluative";

/**
 * Play guns sequentially.
 * Guns do effect later guns playing.
 *
 * ```typescript
 * const leanFireWithCharge = concat(
 *   wait(10),
 *   addAngle(45),
 *   fire(bullet()),
 * );
 * ```
 *
 * @param guns Guns would be played.
 */
export const concat = (...guns: Gun[]): gunO.Concat => new gunO.Concat(...guns);

/**
 * Play guns sequentially.
 * Guns do NOT effect later guns playing.
 *
 * ```typescript
 * const fireTwice = sequential(
 *   fire(bullet()),
 *   wait(10),
 *   fire(bullet()),
 * );
 * ```
 *
 * @param guns Guns would be played.
 */
export const sequential = (...guns: Gun[]): gunO.Sequential =>
  new gunO.Sequential(...guns);

/**
 * Play guns parallel.
 * Guns do NOT effect later guns playing.
 *
 * ```typescript
 * const waitedFire = sequential(
 *   wait(10),
 *   fire(bullet()),
 * );
 * const fireTwiceInSameFrame = parallel(
 *   waitedFire,
 *   waitedFire
 * );
 * ```
 *
 * @param guns Guns would be played.
 */
export const parallel = (...guns: Gun[]): gunO.Parallel =>
  new gunO.Parallel(...guns);

/**
 * Wait frames.
 *
 * ```typescript
 * const fireAt11frame = sequential(
 *   wait(10),
 *   fire(bullet()),
 * );
 * ```
 *
 * @param frames wait frames
 */
export const wait = (frames: TConstantOrLazy<number>): gunO.Wait =>
  new gunO.Wait(frames);

/**
 * Fire bullet.
 *
 * ```typescript
 * const fireBullet = fire(bullet());
 * ```
 *
 * @param bullet Bullet would be fired.
 */
export const fire = (bullet: Bullet): gunO.Fire => new gunO.Fire(bullet);

/**
 * Do nothing.
 */
export const nop = (): gunO.Nop => new gunO.Nop();

/**
 * Repeat guns sequentially.
 * Guns do effect later guns playing.
 *
 * ```typescript
 * const leaningFire = repeat(
 *   { times: 10, interval: 3, name: 'masterRepeat' },
 *   addAngle(linear(0, 90, 'masterRepeat')),
 *   fire(bullet()),
 * );
 * ```
 *
 * @param option Repeating option.
 * @param guns Guns would be played.
 */
export const repeat = (
  option: gunO.TRepeatOption,
  ...guns: Gun[]
): gunO.Repeat => {
  return new gunO.Repeat(option, new gunO.Concat(...guns));
};

/**
 * Repeat guns parallel.
 * Guns do effect later guns playing.
 *
 * ```typescript
 * const burstFire = repeat(
 *   { times: 5, interval: 3 },
 *   fire(bullet()),
 * );
 * const leaningBurstFire = parallelRepeat(
 *   { times: 10, interval: 5, name: 'masterRepeat' }
 *   addAngle(linear(0, 90, 'masterRepeat')),
 *   burstFire,
 * );
 * ```
 *
 * @param option Repeating option.
 * @param guns Guns would be played.
 */
export const parallelRepeat = (
  option: gunO.TRepeatOption,
  ...guns: Gun[]
): gunO.ParallelRepeat => {
  return new gunO.ParallelRepeat(option, new gunO.Concat(...guns));
};

/**
 * Same of `parallelRepeat`.
 *
 * @param option
 * @param guns
 */
export const paraRepeat = (
  option: gunO.TRepeatOption,
  ...guns: Gun[]
): gunO.ParallelRepeat => parallelRepeat(option, ...guns);

/**
 * N-Way firing option.
 */
export interface TNWayOption {
  /** Way num. */
  ways: TConstantOrLazy<number>;
  /** N-Way total angle. Can receive non-positive number. */
  totalAngle: TConstantOrLazy<number>;
  /** Repeating name. Used by LazyEvaluative. */
  name?: string;
}

/**
 * Play N-Way firing as parallel.
 *
 * ```typescript
 * const nWayFiring = nWay(
 *   { ways: 5, totalAngle: 90 }
 *   fire(bullet()),
 * );
 * ```
 *
 * @param option N-Way option.
 * @param guns Guns would be played.
 */
export const nWay = (
  option: TNWayOption,
  ...guns: Gun[]
): gunO.ParallelRepeat => {
  return paraRepeat(
    { times: option.ways, interval: 0, name: option.name },
    mod.addAngle(le.nWayAngle({ totalAngle: option.totalAngle })),
    ...guns
  );
};

/**
 * Whip firing properties.
 */
export type TWhipOption = gunO.TRepeatOption & {
  /** Repeat times. */
  times: TConstantOrLazy<number>;
  /** Speed rate range. */
  speedRateRange: [TConstantOrLazy<number>, TConstantOrLazy<number>];
  /** Repeating name. Used by LazyEvaluative. */
  name?: string;
};

/**
 * Sequential repeating accelerate bullet speed.
 *
 * ```typescript
 * const whipFiring = whip(
 *   { times: 5, speedRateRange: [1, 1.5] },
 *   fire(bullet()),
 * );
 * ```
 *
 * @param option Whip firing option.
 * @param guns Guns would be played.
 */
export const whip = (option: TWhipOption, ...guns: Gun[]): gunO.Repeat => {
  const sr = option.speedRateRange;
  return repeat(
    { times: option.times, interval: 0, name: option.name },
    mod.mltSpeed(le.linear(sr[0], sr[1])),
    ...guns
  );
};

/**
 * Spread firing option.
 */
export interface TSpreadOption {
  /** Fire times. */
  times: TConstantOrLazy<number>;
  /** Speed rate range. */
  speedRateRange: [TConstantOrLazy<number>, TConstantOrLazy<number>];
  /** Repeating name. Used by LazyEvaluative. */
  name?: string;
}

/**
 * Play spread firing.
 *
 * ```typescript
 * const spreadFiring = spread(
 *   { times: 5, speedRateRange: [1, 1.5] },
 *   fire(bullet()),
 * );
 * ```
 *
 * @param option Spread firing option.
 * @param guns Guns would be played.
 */
export const spread = (
  option: TWhipOption,
  ...guns: Gun[]
): gunO.ParallelRepeat => {
  const sr = option.speedRateRange;
  return paraRepeat(
    { times: option.times, interval: 0, name: option.name },
    mod.mltSpeed(le.linear(sr[0], sr[1])),
    ...guns
  );
};

/**
 * Play firing and inverted firing as parallel.
 *
 * ```typescript
 * const mirroredFiring = concat(
 *   useMuzzle('muzzle.L'),
 *   mirror(
 *     { invertedMuzzleName: 'muzzle.R', mirrorTranslationY: true },
 *     fire(bullet),
 *   )
 * );
 * ```
 *
 * @param option Mirror firing option.
 * @param guns Guns would be played.
 */
export const mirror = (
  option: gunO.TMirrorOption,
  ...guns: Gun[]
): gunO.Mirror => {
  return new gunO.Mirror(option, concat(...guns));
};

/**
 * Play firing and inverted firing sequentially.
 *
 * ```typescript
 * const alternatedFiring = concat(
 *   useMuzzle('muzzle.L'),
 *   alternate(
 *     { invertedMuzzleName: 'muzzle.R', mirrorTranslationY: true },
 *     fire(bullet),
 *   )
 * );
 * ```
 *
 * @param option Mirror firing option.
 * @param guns Guns would be played.
 */
export const alternate = (
  option: gunO.TMirrorOption,
  ...guns: Gun[]
): gunO.Alternate => {
  return new gunO.Alternate(option, concat(...guns));
};
