import { Gun } from "../gun";
import { Bullet } from "../bullet";
import { TConstantOrLazy } from "../lazyEvaluative";
import * as gunO from "../elements/gun";
import * as mod from "./gunModifier";
import * as le from "./lazyEvaluative";

export const concat = (...guns: Gun[]): gunO.Concat => new gunO.Concat(...guns);
export const sequential = (...guns: Gun[]): gunO.Sequential =>
  new gunO.Sequential(...guns);
export const parallel = (...guns: Gun[]): gunO.Parallel =>
  new gunO.Parallel(...guns);

export const wait = (frames: TConstantOrLazy<number>): gunO.Wait =>
  new gunO.Wait(frames);

export const fire = (bullet: Bullet): gunO.Fire => new gunO.Fire(bullet);

export const nop = (): gunO.Nop => new gunO.Nop();

export const repeat = (
  option: gunO.TRepeatOption,
  ...guns: Gun[]
): gunO.Repeat => {
  return new gunO.Repeat(option, new gunO.Concat(...guns));
};

export const parallelRepeat = (
  option: gunO.TRepeatOption,
  ...guns: Gun[]
): gunO.ParallelRepeat => {
  return new gunO.ParallelRepeat(option, new gunO.Concat(...guns));
};

export const paraRepeat = (
  option: gunO.TRepeatOption,
  ...guns: Gun[]
): gunO.ParallelRepeat => parallelRepeat(option, ...guns);

export interface TNWayOption {
  ways: TConstantOrLazy<number>;
  totalAngle: TConstantOrLazy<number>;
  name?: string;
}

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

export type TWhipOption = gunO.TRepeatOption & {
  times: TConstantOrLazy<number>;
  speedRateRange: [TConstantOrLazy<number>, TConstantOrLazy<number>];
  name?: string;
};

export const whip = (option: TWhipOption, ...guns: Gun[]): gunO.Repeat => {
  const sr = option.speedRateRange;
  return repeat(
    { times: option.times, interval: 0, name: option.name },
    mod.mltSpeed(le.linear(sr[0], sr[1])),
    ...guns
  );
};

export interface TSpreadOption {
  times: TConstantOrLazy<number>;
  speedRateRange: [TConstantOrLazy<number>, TConstantOrLazy<number>];
  name?: string;
}

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

export const mirror = (
  option: gunO.TMirrorOption,
  ...guns: Gun[]
): gunO.Mirror => {
  return new gunO.Mirror(option, concat(...guns));
};

export const alternate = (
  option: gunO.TMirrorOption,
  ...guns: Gun[]
): gunO.Alternate => {
  return new gunO.Alternate(option, concat(...guns));
};
