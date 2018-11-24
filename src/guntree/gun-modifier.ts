import { IFiringState, IGun } from 'guntree/gun';

export class Add implements IGun {
    constructor(private readonly name: string,
                private readonly adding: number) {}

    *play(state: IFiringState): IterableIterator<void> {
        const param = state.parameters.get(this.name);
        if (param === undefined) throw new Error();  // TODO:
        param.add(this.adding);
    }
}
