import { IFiringState } from '../firing-state';
import { ILazyEvaluative, TConstantOrLazy } from '../lazyEvaluative';

export class Linear implements ILazyEvaluative<number> {
    constructor(private readonly start: TConstantOrLazy<number>,
                private readonly stop: TConstantOrLazy<number>,
                private readonly target?: string) {}

    calc(state: IFiringState): number {
        const start = getNumberFromLazy(state, this.start);
        const stop = getNumberFromLazy(state, this.stop);
        const repeat = state.repeatStates.get(this.target);
        const rate = repeat.finished / repeat.total;
        return stop * rate + start * (1 - rate);
    }
}

export type TIterateOption = {
    /** Default value used if repeating is not in array */
    default?: number;

    /** Used for specifying repeat */
    target?: string;
};

/**
 * Iterate values in argument with repeating.
 */
export class Iterate implements ILazyEvaluative<number> {
    /**
     *
     * @param array values iterated with repeating
     * @param option
     */
    constructor(private readonly array: (TConstantOrLazy<number>)[],
                private readonly option?: TIterateOption) {}

    calc(state: IFiringState): number {
        const target = this.option !== undefined ? this.option.target : undefined;
        const repeat = state.repeatStates.get(target);
        if (repeat.finished >= this.array.length) {
            if (this.option !== undefined && this.option.default !== undefined) return this.option.default;
            throw new Error('Iterate expected repeating out of range but default value is not in option');
        }
        const value = this.array[repeat.finished];
        if (typeof value === 'number') return value;
        return value.calc(state);
    }
}

/**
 * Deal rounded value
 */
export class Round implements ILazyEvaluative<number> {
    /**
     *
     * @param input number or lazyEvaluative deals number
     */
    constructor(private readonly input: TConstantOrLazy<number>) {}

    calc(state: IFiringState): number {
        if (typeof this.input === 'number') return Math.round(this.input);
        return Math.round(this.input.calc(state));
    }
}

/**
 * Deal centerized linear values.
 *
 * example:
 *
 * new CenterizedLinear(15)  // deal [-5, 0, 5] values when repeat 3 times
 */
export class CenterizedLinear implements ILazyEvaluative<number> {
    constructor(private readonly totalRange: TConstantOrLazy<number>,
                private readonly target?: string) {}

    calc(state: IFiringState): number {
        const totalRange = getNumberFromLazy(state, this.totalRange);
        const repeat = state.repeatStates.get(this.target);
        const rate = repeat.finished / repeat.total;
        const diff = totalRange / repeat.total;
        return totalRange * rate - (totalRange - diff) / 2;
    }
}

const getNumberFromLazy = (state: IFiringState, value: TConstantOrLazy<number>): number => {
    if (typeof value === 'number') return value;
    return value.calc(state);
};
