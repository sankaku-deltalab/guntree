import { range } from 'lodash';

import { ILazyEvaluative } from 'guntree/lazy-evaluative';

export interface IRepeatState {
    finished: number;
    total: number;
}

export interface IFiringState {
    copy(): IFiringState;

    getRepeatState(position: number): IRepeatState;
    getRepeatStateByName(name: string): IRepeatState;

    startRepeating(state: IRepeatState, name?: string): IRepeatState;
    notifyContinueRepeating(state: IRepeatState): void;
    finishRepeating(state: IRepeatState): void;
}

export interface IGun {
    play(state: IFiringState): IterableIterator<void>;
}

export function getRepeatStateByTarget(state: IFiringState, target: number | string | undefined): IRepeatState {
    if (typeof target === 'number') return state.getRepeatState(target);
    if (typeof target === 'string') return state.getRepeatStateByName(target);
    return state.getRepeatState(0);
}

export type RepeatOption = {
    times: number;
    interval: number;
    name?: string;
};

export class Repeat implements IGun {
    private readonly guns: IGun[];

    constructor(private readonly option: RepeatOption,
                ...guns: IGun[]) {
        this.guns = guns;
    }

    *play(state: IFiringState): IterableIterator<void> {
        const stateClone = state.copy();
        const repeatTimes = this.option.times;

        const repeatState = stateClone.startRepeating({ finished: 0, total: repeatTimes }, this.option.name);
        for (const finished of range(repeatTimes)) {
            // fire children
            for (const gun of this.guns) yield* gun.play(stateClone);

            // wait interval
            yield* wait(this.option.interval);

            // process repeating
            repeatState.finished += 1;

            // finish firing if complete firing
            if (finished === repeatTimes - 1) {
                stateClone.finishRepeating(repeatState);
            }
        }
    }
}

export function* wait(frames: number): IterableIterator<void> {
    for (const _ of range(frames)) {
        yield;
    }
}
