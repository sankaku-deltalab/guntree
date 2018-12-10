import { IFiringState } from 'guntree/gun';

export interface ILazyEvaluative<T> {
    /**
     * Calculate value for gun
     * @param state Current firing state
     */
    calc(state: IFiringState): T;
}
