import { IFiringState, getRepeatStateByTarget } from 'guntree/gun';

export interface ILazyEvaluative<T> {
    /**
     * Calculate value for gun
     * @param state Current firing state
     */
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
    /** Default value used if repeating is not in array */
    default?: T;

    /** Used for specifying repeat */
    target?: string | number;
};

/**
 * Iterate values in argument with repeating.
 */
export class Iterate<T> implements ILazyEvaluative<T> {
    /**
     *
     * @param array values iterated with repeating
     * @param option
     */
    constructor(private readonly array: T[],
                private readonly option?: TIterateOption<T>) {}

    calc(state: IFiringState): T {
        const target = this.option !== undefined ? this.option.target : undefined;
        const repeat = getRepeatStateByTarget(state, target);
        if (repeat.finished >= this.array.length) {
            if (this.option !== undefined && this.option.default !== undefined) return this.option.default;
            throw new Error('Iterate expected repeating out of range but default value is not in option');
        }
        return this.array[repeat.finished];
    }
}

/**
 * Deal rounded value
 */
export class Round implements ILazyEvaluative<number> {
    /**
     *
     * @param input number or lazy-evaluative deals number
     */
    constructor(private readonly input: number | ILazyEvaluative<number>) {}

    calc(state: IFiringState): number {
        if (typeof this.input === 'number') return Math.round(this.input);
        return Math.round(this.input.calc(state));
    }
}
