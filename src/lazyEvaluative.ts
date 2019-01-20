import { IFiringState } from './gun';

export interface ILazyEvaluative<T> {
    /**
     * Calculate value for gun
     * @param state Current firing state
     */
    calc(state: IFiringState): T;
}

export type TConstantOrLazy<T>  = T | ILazyEvaluative<T>;