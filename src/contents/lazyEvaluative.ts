import { TConstantOrLazy } from '../lazyEvaluative';
import * as leO from '../elements/lazyEvaluative';

export const linear = (start: TConstantOrLazy<number>,
                       stop: TConstantOrLazy<number>,
                       target?: string) => new leO.Linear(start, stop, target);

export const centerizedLinear = (totalRange: TConstantOrLazy<number>,
                                 target?: string) => new leO.CenterizedLinear(totalRange, target);

export const iterate = (array: (TConstantOrLazy<number>)[],
                        option?: leO.TIterateOption) => new leO.Iterate(array, option);

export const round = (input: TConstantOrLazy<number>) => new leO.Round(input);

export type TAddNWayAngleOption = {
    totalAngle: TConstantOrLazy<number>;
    name?: string;
};

export const nWayAngle = (option: TAddNWayAngleOption) => new leO.CenterizedLinear(option.totalAngle, option.name);

export const createTransform = (option: leO.TCreateTransformOption) => new leO.CreateTransform(option);
