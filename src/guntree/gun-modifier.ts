import { IFiringState, IGun } from 'guntree/gun';
import { ILazyEvaluative } from 'guntree/lazy-evaluative';

/**
 * Add parameter.
 */
export class Add implements IGun {
    /**
     * @param name paramter name
     * @param adding adding value or lazy-evaluative deal adding value
     */
    constructor(private readonly name: string,
                private readonly adding: number | ILazyEvaluative<number>) {}

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
export class Multiply implements IGun {
    /**
     * @param name paramter name
     * @param multiplier multiplier value or lazy-evaluative deal multiplier value
     */
    constructor(private readonly name: string,
                private readonly multiplier: number | ILazyEvaluative<number>) {}

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
export class MultiplyLaterAdding implements IGun {
    /**
     * @param name paramter name
     * @param multiplier multiplier value or lazy-evaluative deal multiplier value
     */
    constructor(private readonly name: string,
                private readonly multiplier: number | ILazyEvaluative<number>) {}

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
export class Reset implements IGun {
    /**
     * @param name paramter name
     * @param newValue new value value or lazy-evaluative deal multiplier value
     */
    constructor(private readonly name: string,
                private readonly newValue: number | ILazyEvaluative<number>) {}

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
