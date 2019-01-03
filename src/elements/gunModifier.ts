import { IFiringState, IGun, TVector2D } from '../gun';
import { ILazyEvaluative, TConstantOrLazy } from '../lazyEvaluative';

/**
 * Add parameter.
 */
export class AddParameter implements IGun {
    /**
     * @param name paramter name
     * @param adding adding value or lazyEvaluative deal adding value
     */
    constructor(private readonly name: string,
                private readonly adding: TConstantOrLazy<number>) {}

    *play(state: IFiringState): IterableIterator<void> {
        const param = state.parameters.get(this.name);
        if (param === undefined) throw new Error(`Parameter ${this.name} is not exist`);
        param.add(this.calcAdding(state));
    }

    private calcAdding(state: IFiringState): number {
        if (typeof this.adding === 'number') return this.adding;
        return this.adding.calc(state);
    }
}

/**
 * Multiply parameter.
 */
export class MultiplyParameter implements IGun {
    /**
     * @param name paramter name
     * @param multiplier multiplier value or lazyEvaluative deal multiplier value
     */
    constructor(private readonly name: string,
                private readonly multiplier: TConstantOrLazy<number>) {}

    *play(state: IFiringState): IterableIterator<void> {
        const param = state.parameters.get(this.name);
        if (param === undefined) throw new Error(`Parameter ${this.name} is not exist`);
        param.multiply(this.calcMultiplier(state));
    }

    private calcMultiplier(state: IFiringState): number {
        if (typeof this.multiplier === 'number') return this.multiplier;
        return this.multiplier.calc(state);
    }
}

/**
 * Multiply later adding value to parameter.
 */
export class MultiplyLaterAddingParameter implements IGun {
    /**
     * @param name paramter name
     * @param multiplier multiplier value or lazyEvaluative deal multiplier value
     */
    constructor(private readonly name: string,
                private readonly multiplier: TConstantOrLazy<number>) {}

    *play(state: IFiringState): IterableIterator<void> {
        const param = state.parameters.get(this.name);
        if (param === undefined) throw new Error(`Parameter ${this.name} is not exist`);
        param.multiplyLaterAdding(this.calcMultiplier(state));
    }

    private calcMultiplier(state: IFiringState): number {
        if (typeof this.multiplier === 'number') return this.multiplier;
        return this.multiplier.calc(state);
    }
}

/**
 * Reset value to parameter.
 */
export class ResetParameter implements IGun {
    /**
     * @param name paramter name
     * @param newValue new value value or lazyEvaluative deal multiplier value
     */
    constructor(private readonly name: string,
                private readonly newValue: TConstantOrLazy<number>) {}

    *play(state: IFiringState): IterableIterator<void> {
        const param = state.parameters.get(this.name);
        if (param === undefined) throw new Error(`Parameter ${this.name} is not exist`);
        param.reset(this.calcNewValue(state));
    }

    private calcNewValue(state: IFiringState): number {
        if (typeof this.newValue === 'number') return this.newValue;
        return this.newValue.calc(state);
    }
}

/**
 * Fire bullet.
 */
export class SetText implements IGun {
    /**
     * @param key Key of text
     * @param text text
     */
    constructor(private readonly key: string,
                private readonly text: TConstantOrLazy<string>) {}

    *play(state: IFiringState): IterableIterator<void> {
        state.texts.set(this.key, this.calcText(state));
    }

    private calcText(state: IFiringState): string {
        if (typeof this.text === 'string') return this.text;
        return this.text.calc(state);
    }
}

/**
 * Set vector to FiringState.
 */
export class SetVector implements IGun {
    /**
     * @param key key of vector
     * @param vector vector
     */
    constructor(private readonly key: string,
                private readonly vector: TConstantOrLazy<TVector2D >) {}

    *play(state: IFiringState): IterableIterator<void> {
        state.vectors.set(this.key, this.calcVector(state));
    }

    private calcVector(state: IFiringState): TVector2D {
        if ('x' in this.vector) return this.vector;
        return this.vector.calc(state);
    }
}

/**
 * Add vector to FiringState.
 */
export class AddVector implements IGun {
    /**
     * @param key key of vector
     * @param vector vector would be added
     */
    constructor(private readonly key: string,
                private readonly vector: TConstantOrLazy<TVector2D >) {}

    *play(state: IFiringState): IterableIterator<void> {
        const vec = state.vectors.get(this.key);
        if (vec === undefined) throw new Error(`vector must exist at '${this.key}'`);
        state.vectors.set(this.key, addVector(vec, this.calcVector(state)));
    }

    private calcVector(state: IFiringState): TVector2D {
        if ('x' in this.vector) return this.vector;
        return this.vector.calc(state);
    }
}

const addVector = (vec1: TVector2D, vec2: TVector2D): TVector2D => {
    return {
        x: vec1.x + vec2.x,
        y: vec1.y + vec2.y,
    };
};
