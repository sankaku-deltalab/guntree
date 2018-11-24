import { IFiringState, IGun } from 'guntree/gun';
import { ILazyEvaluative } from 'guntree/lazy-evaluative';

export class Add implements IGun {
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
