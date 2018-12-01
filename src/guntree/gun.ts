import { range } from 'lodash';

import { ILazyEvaluative } from 'guntree/lazy-evaluative';
import { Parameter } from 'guntree/parameter';

export interface IRepeatState {
    finished: number;
    total: number;
}

export interface IFiringState {
    parameters: Map<string, Parameter>;

    copy(): IFiringState;

    getRepeatState(position: number): IRepeatState;
    getRepeatStateByName(name: string): IRepeatState;

    startRepeating(state: IRepeatState, name?: string): IRepeatState;
    finishRepeating(state: IRepeatState): void;

    notifyFired(bullet: IBullet): void;
}

export class FiringState {
    readonly parameters: Map<string, Parameter>;
    private readonly repeatStateStack: IRepeatState[];
    private readonly repeatMap: Map<string, IRepeatState>;

    constructor() {
        this.parameters = new Map();
        this.repeatStateStack = [{ finished: 0, total: 1 }];
        this.repeatMap = new Map();
    }

    copy(): FiringState {
        const clone = new FiringState();
        for (const [key, param] of this.parameters) {
            clone.parameters.set(key, param.copy());
        }
        return clone;
    }

    getRepeatState(position: number): IRepeatState {
        const idx = this.repeatStateStack.length - 1 - position;
        return this.repeatStateStack[idx];
    }

    getRepeatStateByName(name: string): IRepeatState {
        const rs = this.repeatMap.get(name);
        if (rs === undefined) throw new Error();
        return rs;
    }

    startRepeating(state: IRepeatState, name?: string): IRepeatState {
        this.repeatStateStack.push(state);
        if (name !== undefined) {
            this.repeatMap.set(name, state);
        }
        return state;
    }

    finishRepeating(state: IRepeatState): void {
        if (this.repeatStateStack.length === 1) throw new Error('Repeating was finished');
        this.repeatStateStack.pop();
    }
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
    times: number | ILazyEvaluative<number>;
    interval: number | ILazyEvaluative<number>;
    name?: string;
};

/**
 * Bullet express property of bullet.
 */
export interface IBullet {}

/**
 * Fire bullet.
 */
export class Fire implements IGun {
    /**
     * @param bullet Fired bullet
     */
    constructor(private readonly bullet: IBullet) {}

    *play(state: IFiringState): IterableIterator<void> {
        state.notifyFired(this.bullet);
    }
}

export class Repeat implements IGun {
    private readonly guns: IGun[];

    constructor(private readonly option: RepeatOption,
                ...guns: IGun[]) {
        this.guns = guns;
    }

    *play(state: IFiringState): IterableIterator<void> {
        const repeatTimes = this.calcRepeatTimes(state);
        const stateClone = state.copy();

        const repeatState = stateClone.startRepeating({ finished: 0, total: repeatTimes }, this.option.name);
        for (const _ of range(repeatTimes)) {
            // fire children
            for (const gun of this.guns) yield* gun.play(stateClone);

            // wait interval
            yield* wait(this.calcInterval(stateClone));

            // process repeating
            repeatState.finished += 1;
        }
        stateClone.finishRepeating(repeatState);
    }

    private calcRepeatTimes(state: IFiringState) {
        if (typeof this.option.times === 'number') return this.option.times;
        return this.option.times.calc(state);
    }

    private calcInterval(state: IFiringState) {
        if (typeof this.option.interval === 'number') return this.option.interval;
        return this.option.interval.calc(state);
    }
}

export function* wait(frames: number): IterableIterator<void> {
    for (const _ of range(frames)) {
        yield;
    }
}
