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
        if (param === undefined) throw new Error();  // TODO:
        param.add(this.calcAdding(state));
    }

    private calcAdding(state: IFiringState): number {
        if (typeof this.adding === 'number') return this.adding;
        return this.adding.calc(state);
    }
}
