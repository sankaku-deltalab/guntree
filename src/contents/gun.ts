import { IGun, IBullet } from '../gun';
import { TConstantOrLazy } from '../lazyEvaluative';
import * as gunO from '../elements/gun';
import * as mod from './gunModifier';
import * as le from './lazyEvaluative';

export const concat = (...guns: IGun[]) => new gunO.Concat(...guns);
export const sequential = (...guns: IGun[]) => new gunO.Sequential(...guns);
export const parallel = (...guns: IGun[]) => new gunO.Parallel(...guns);

export const wait = (frames: TConstantOrLazy<number>) => new gunO.Wait(frames);

export const fire = (bullet: IBullet) => new gunO.Fire(bullet);

export const nop = () => new gunO.Nop();

export const repeat = (option: gunO.TRepeatOption, ...guns: IGun[]) => {
    return new gunO.Repeat(option, new gunO.Concat(...guns));
};

export const parallelRepeat = (option: gunO.TRepeatOption, ...guns: IGun[]) => {
    return new gunO.ParallelRepeat(option, new gunO.Concat(...guns));
};

export const paraRepeat = (option: gunO.TRepeatOption, ...guns: IGun[]) => parallelRepeat(option, ...guns);

export type TNWayOption = {
    ways: TConstantOrLazy<number>;
    totalAngle: TConstantOrLazy<number>;
    name?: string;
};

export const nWay = (option: TNWayOption, ...guns: IGun[]) => {
    return paraRepeat(
        { times: option.ways, interval: 0, name: option.name },
        mod.addAngle(
            le.nWayAngle({ totalAngle: option.totalAngle }),
        ),
        ...guns,
    );
};

export type TWhipOption = gunO.TRepeatOption & {
    times: TConstantOrLazy<number>,
    speedRateRange: [TConstantOrLazy<number>, TConstantOrLazy<number>],
    name?: string,
};

export const whip = (option: TWhipOption, ...guns: IGun[]) => {
    const sr = option.speedRateRange;
    return repeat(
        { times: option.times, interval: 0, name: option.name },
        mod.mltSpeed(le.linear(sr[0], sr[1])),
        ...guns,
    );
};

export type TSpreadOption = {
    times: TConstantOrLazy<number>,
    speedRange: [number, number],
    name?: string,
};

export const spread = (option: TWhipOption, ...guns: IGun[]) => {
    const sr = option.speedRateRange;
    return paraRepeat(
        { times: option.times, interval: 0, name: option.name },
        mod.mltSpeed(le.linear(sr[0], sr[1])),
        ...guns,
    );
};

export const mirror = (option: gunO.TMirrorOption, ...guns: IGun[]) => {
    return new gunO.Mirror(option, concat(...guns));
};

export const alternate = (option: gunO.TMirrorOption, ...guns: IGun[]) => {
    return new gunO.Alternate(option, concat(...guns));
};
