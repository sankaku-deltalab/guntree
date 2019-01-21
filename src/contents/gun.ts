import { IGun, IBullet } from '../gun';
import { TConstantOrLazy } from '../lazyEvaluative';
import * as gunO from '../elements/gun';
import * as mod from '../contents/gunModifier';
import * as le from '../contents/lazyEvaluative';

export const concat = (...guns: IGun[]) => new gunO.Concat(...guns);
export const sequential = (...guns: IGun[]) => new gunO.Sequential(...guns);
export const parallel = (...guns: IGun[]) => new gunO.Parallel(...guns);

export const wait = (frames: TConstantOrLazy<number>) => new gunO.Wait(frames);

export const fire = (bullet: IBullet) => new gunO.Fire(bullet);

export const repeat = (option: gunO.TRepeatOption, ...guns: IGun[]) => {
    return new gunO.Repeat(option, new gunO.Concat(...guns));
};

export const parallelRepeat = (option: gunO.TRepeatOption, ...guns: IGun[]) => {
    return new gunO.ParallelRepeat(option, new gunO.Concat(...guns));
};

export const paraRepeat = (option: gunO.TRepeatOption, ...guns: IGun[]) => {
    return parallelRepeat(option, new gunO.Concat(...guns));
};

export type TNWayOption = {
    ways: TConstantOrLazy<number>;
    totalAngle: TConstantOrLazy<number>;
    name?: string;
};

export const nWay = (option: TNWayOption, ...guns: IGun[]) => {
    return paraRepeat({ times: option.ways, interval: 0, name: option.name },
                      mod.addNWayAngle({ totalAngle: option.totalAngle, name: option.name }),
                      ...guns);
};

export type TWhipOption = gunO.TRepeatOption & {
    speedRange: [number, number],
};

export const whip = (option: TWhipOption, ...guns: IGun[]) => {
    return repeat(option,
                  mod.addSpeed(le.linear(option.speedRange[0], option.speedRange[1])),
                  ...guns);
};

export type TSpreadOption = {
    times: TConstantOrLazy<number>,
    speedRange: [number, number],
};

export const spread = (option: TWhipOption, ...guns: IGun[]) => {
    return paraRepeat(option,
                      mod.addSpeed(le.linear(option.speedRange[0], option.speedRange[1])),
                      ...guns);
};
