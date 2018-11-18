import { IFiringState, IRepeatState, getRepeatStateByTarget } from 'guntree/gun';

export interface ILazyEvaluative<T> {
    calc(state: IFiringState): T;
}

export class Linear implements ILazyEvaluative<number> {
    constructor(private readonly start: number,
                private readonly stop: number,
                private readonly target?: number | string) {}

    calc(state: IFiringState): number {
        const repeat = getRepeatStateByTarget(state, this.target);
        const rate = repeat.finished / repeat.total;
        return this.stop * rate + this.start * (1 - rate);
    }
}

export type TIterateOption<T> = {
    default?: T;
};

export class Iterate<T> implements ILazyEvaluative<T> {
    constructor(private readonly array: T[],
                private readonly option?: TIterateOption<T>) {}

    calc(state: IFiringState): T {
        const repeat = getRepeatStateByTarget(state, undefined);
        if (repeat.finished >= this.array.length) {
            if (this.option !== undefined && this.option.default !== undefined) return this.option.default;
            throw new Error('Iterate expected repeating out of range but default value is not in option');
        }
        return this.array[repeat.finished];
    }
}
