import * as mat from 'transformation-matrix';

import { IFiringState } from '../firing-state';
import { ILazyEvaluative, TConstantOrLazy, calcValueFromConstantOrLazy } from '../lazyEvaluative';

export class Linear implements ILazyEvaluative<number> {
    constructor(private readonly start: TConstantOrLazy<number>,
                private readonly stop: TConstantOrLazy<number>,
                private readonly target?: string) {}

    calc(state: IFiringState): number {
        const start = calcValueFromConstantOrLazy(state, this.start);
        const stop = calcValueFromConstantOrLazy(state, this.stop);
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
        const totalRange = calcValueFromConstantOrLazy(state, this.totalRange);
        const repeat = state.repeatStates.get(this.target);
        const rate = repeat.finished / repeat.total;
        const diff = totalRange / repeat.total;
        return totalRange * rate - (totalRange - diff) / 2;
    }
}

export type TCreateTransformOption = {
    translation?: TConstantOrLazy<number> | [TConstantOrLazy<number>, TConstantOrLazy<number>];
    rotationDeg?: TConstantOrLazy<number>;
    scale?: TConstantOrLazy<number> | [TConstantOrLazy<number>, TConstantOrLazy<number>];
};

type TCreateTransformOptionFilled = {
    translation: TConstantOrLazy<number> | [TConstantOrLazy<number>, TConstantOrLazy<number>];
    rotationDeg: TConstantOrLazy<number>;
    scale: TConstantOrLazy<number> | [TConstantOrLazy<number>, TConstantOrLazy<number>];
};

/**
 * Create transform.
 *
 * example:
 *
 * new CreateTransform({
 *     translation: [10, 0],
 *     rotationDeg: 90,
 *     scale: 1.25,
 * });
 */
export class CreateTransform implements ILazyEvaluative<mat.Matrix> {
    private readonly option: TCreateTransformOptionFilled;

    /**
     * @param option Translation values
     */
    constructor(option: TCreateTransformOption) {
        const defaultOption: TCreateTransformOptionFilled = {
            translation: 0,
            rotationDeg: 0,
            scale: 1,
        };
        this.option = Object.assign(defaultOption, option);
    }

    calc(state: IFiringState): mat.Matrix {
        const tr: [number, number | undefined] =
            Array.isArray(this.option.translation)
            ? calcTupleLe(state, this.option.translation)
            : [calcValueFromConstantOrLazy(state, this.option.translation), undefined];
        const rot = calcValueFromConstantOrLazy(state, this.option.rotationDeg);
        const sc: [number, number | undefined] =
            Array.isArray(this.option.scale)
            ? calcTupleLe(state, this.option.scale)
            : [calcValueFromConstantOrLazy(state, this.option.scale), undefined];
        return mat.transform(
            mat.translate(tr[0], tr[1]),
            mat.rotateDEG(rot),
            mat.scale(sc[0], sc[1]),
        );
    }
}

const calcTupleLe = (
        state: IFiringState,
        tuple: [TConstantOrLazy<number>, TConstantOrLazy<number>]): [number, number | undefined] => {
    return [
        calcValueFromConstantOrLazy(state, tuple[0]),
        calcValueFromConstantOrLazy(state, tuple[1]),
    ];
};
