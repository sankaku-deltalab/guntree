import { range } from 'lodash';

import { ILazyEvaluative } from 'guntree/lazy-evaluative';
import { Parameter } from 'guntree/parameter';
import { IPlayer } from 'guntree/player';

export interface IRepeatState {
    finished: number;
    total: number;
}

/**
 * FiringState contains information while firing.
 */
export interface IFiringState {
    /** Parameters express real value. */
    parameters: Map<string, Parameter>;

    /** Parameters express string value. */
    texts: Map<string, string>;

    /** Player playing GunTree with this state. */
    player: IPlayer;

    /** Copy this state. */
    copy(): IFiringState;

    /**
     * Get repeat state with position.
     *
     * e.g.
     * - getRepeatState(0) return current repeating,
     * - getRepeatState(1) return previous repeating.
     *
     * @param position Repeating position
     */
    getRepeatState(position: number): IRepeatState;

    /**
     * Get repeat state with name.
     *
     * @param name Repeating name
     */
    getRepeatStateByName(name: string): IRepeatState;

    /**
     * Notify start repeating.
     * Called by guns.
     * Return input repeat state.
     *
     * @param state Repeat state
     * @param name Repeat state name
     */
    startRepeating(state: IRepeatState, name?: string): IRepeatState;

    /**
     * Notify finish repeating.
     * Started repeating must be finished.
     *
     * @param state Repeat state
     * @param name Repeat state name
     */
    finishRepeating(state: IRepeatState, name?: string): void;
}

export class FiringState implements IFiringState {
    readonly parameters: Map<string, Parameter>;
    readonly texts: Map<string, string>;
    private readonly repeatStateStack: IRepeatState[];
    private readonly repeatMap: Map<string, IRepeatState[]>;

    constructor(readonly player: IPlayer) {
        this.parameters = new Map();
        this.texts = new Map();
        this.repeatStateStack = [{ finished: 0, total: 1 }];
        this.repeatMap = new Map();
    }

    copy(): FiringState {
        const clone = new FiringState(this.player);
        for (const [key, param] of this.parameters) {
            clone.parameters.set(key, param.copy());
        }
        for (const [key, value] of this.texts) {
            clone.texts.set(key, value);
        }
        return clone;
    }

    getRepeatState(position: number): IRepeatState {
        const idx = this.repeatStateStack.length - 1 - position;
        return this.repeatStateStack[idx];
    }

    getRepeatStateByName(name: string): IRepeatState {
        const rsStack = this.repeatMap.get(name);
        if (rsStack === undefined) throw new Error();
        return rsStack[rsStack.length - 1];
    }

    startRepeating(state: IRepeatState, name?: string): IRepeatState {
        this.repeatStateStack.push(state);
        if (name !== undefined) {
            this.setRepeatMap(state, name);
        }
        return state;
    }

    private setRepeatMap(state: IRepeatState, name: string) {
        if (!this.repeatMap.has(name)) {
            this.repeatMap.set(name, []);
        }

        const rsStack = this.repeatMap.get(name);
        if (rsStack === undefined) throw new Error();
        rsStack.push(state);
    }

    finishRepeating(state: IRepeatState, name?: string): void {
        if (this.repeatStateStack.length === 1) throw new Error('Repeating was finished');
        if (name !== undefined) {
            this.popRepeatMap(state, name);
        }
        const rs = this.repeatStateStack.pop();
        if (rs !== state) throw new Error('Finishing repeating is not final repeating');
    }

    private popRepeatMap(state: IRepeatState, name: string) {
        const rsStack = this.repeatMap.get(name);
        if (rsStack === undefined || rsStack.length === 0) {
            throw new Error(`repeating <${name}> was finished but not repeating`);
        }
        const rs = rsStack.pop();
        if (rs !== state) throw new Error('Finishing repeating is not final repeating');
        return rs;
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
        state.player.notifyFired(state, this.bullet);
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
        stateClone.finishRepeating(repeatState, this.option.name);
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

/**
 * Fire bullet.
 */
export class SetText implements IGun {
    /**
     * @param key Key of text
     * @param text text
     */
    constructor(private readonly key: string,
                private readonly text: string | ILazyEvaluative<string>) {}

    *play(state: IFiringState): IterableIterator<void> {
        state.texts.set(this.key, this.calcText(state));
    }

    private calcText(state: IFiringState): string {
        if (typeof this.text === 'string') return this.text;
        return this.text.calc(state);
    }
}

export function* wait(frames: number): IterableIterator<void> {
    for (const _ of range(frames)) {
        yield;
    }
}
