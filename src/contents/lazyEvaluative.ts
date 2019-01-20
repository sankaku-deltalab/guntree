import { TVector2D } from '../gun';
import { TConstantOrLazy } from '../lazyEvaluative';
import * as leO from '../elements/lazyEvaluative';

export const linear = (start: TConstantOrLazy<number>,
                       stop: TConstantOrLazy<number>,
                       target?: number | string) => new leO.Linear(start, stop, target);

export const centerizedLinear = (totalRange: TConstantOrLazy<number>,
                                 target?: number | string) => new leO.CenterizedLinear(totalRange, target);

export const iterate = (array: (TConstantOrLazy<number>)[],
                        option?: leO.TIterateOption) => new leO.Iterate(array, option);

export const round = (input: TConstantOrLazy<number>) => new leO.Round(input);

export const getLocation = (name: string) => new leO.GetLocation(name);

export const calcDirection = (src: TConstantOrLazy<TVector2D>,
                              dest: TConstantOrLazy<TVector2D>) => new leO.CalcDirection(src, dest);

export const globalizeVector = (vector: TConstantOrLazy<TVector2D>,
                                angle: TConstantOrLazy<number>) => new leO.GlobalizeVector(vector, angle);

export type TAddNWayAngleOption = {
    totalAngle: TConstantOrLazy<number>;
    name?: string;
};

export const nWayAngle = (option: TAddNWayAngleOption) => new leO.CenterizedLinear(option.totalAngle, option.name);
