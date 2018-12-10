import { IFiringState, TVector2D, getRepeatStateByTarget } from 'guntree/gun';

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

export type TIterateOption = {
    /** Default value used if repeating is not in array */
    default?: number;

    /** Used for specifying repeat */
    target?: string | number;
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
    constructor(private readonly array: (number | ILazyEvaluative<number>)[],
                private readonly option?: TIterateOption) {}

    calc(state: IFiringState): number {
        const target = this.option !== undefined ? this.option.target : undefined;
        const repeat = getRepeatStateByTarget(state, target);
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
     * @param input number or lazy-evaluative deals number
     */
    constructor(private readonly input: number | ILazyEvaluative<number>) {}

    calc(state: IFiringState): number {
        if (typeof this.input === 'number') return Math.round(this.input);
        return Math.round(this.input.calc(state));
    }
}

/**
 * Deal location.
 */
export class GetLocation implements ILazyEvaluative<TVector2D> {
    /**
     *
     * @param name name of location
     */
    constructor(private readonly name: string) {}

    calc(state: IFiringState): TVector2D {
        return state.player.getLocation(this.name);
    }
}

/**
 * Deal direction between to locations.
 */
export class CalcDirection implements ILazyEvaluative<number> {
    /**
     * @param src source of direction
     * @param dest destination of direction
     */
    constructor(private readonly src: TVector2D | ILazyEvaluative<TVector2D>,
                private readonly dest: TVector2D | ILazyEvaluative<TVector2D>) {}

    calc(state: IFiringState): number {
        const src = getVectorFromLazy(state, this.src);
        const dest = getVectorFromLazy(state, this.dest);
        const direction = [dest.x - src.x, dest.y - src.y];
        const angleRad = Math.atan2(direction[1], direction[0]);
        return 360 * angleRad / (2 * Math.PI);
    }
}

/**
 * Deal globalized vector.
 */
export class GlobalizeVector implements ILazyEvaluative<TVector2D> {
    constructor(private readonly vector: TVector2D | ILazyEvaluative<TVector2D>,
                private readonly angle: number | ILazyEvaluative<number>) {}

    calc(state: IFiringState): TVector2D {
        const vector = getVectorFromLazy(state, this.vector);
        const angleDeg = getNumberFromLazy(state, this.angle);
        const angleRad = angleDeg * 2 * Math.PI / 360;
        return {
            x: vector.x * Math.cos(angleRad) - vector.y * Math.sin(angleRad),
            y: vector.x * Math.sin(angleRad) + vector.y * Math.cos(angleRad),
        };
    }
}

const getVectorFromLazy = (state: IFiringState, vector: TVector2D | ILazyEvaluative<TVector2D>): TVector2D => {
    if ('x' in vector && 'y' in vector) return vector;
    return vector.calc(state);
};

const getNumberFromLazy = (state: IFiringState, value: number | ILazyEvaluative<number>): number => {
    if (typeof value === 'number') return value;
    return value.calc(state);
};
