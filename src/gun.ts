import * as mat from 'transformation-matrix';

import { Parameter } from './parameter';
import { IPlayer } from './player';

export interface IRepeatState {
    finished: number;
    total: number;
}

/**
 * FiringState contains information while firing.
 */
export interface IFiringState {
    /** Contain data used when fired. */
    fireData: IFireData;

    /** Player playing GunTree with this state. */
    player: IPlayer;

    /** Copy this state. */
    copy(): IFiringState;

    /**
     * Get repeat state with name.
     * If name is not given, return latest repeat state.
     * If not repeating, return { finished: 0, total: 1 }.
     *
     * @param name Repeating name
     */
    getRepeatState(name?: string): IRepeatState;

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

/**
 * IFireData contains data used when bullet was fired.
 */
export interface IFireData {
    /** Bullet spawning transform. */
    transform: mat.Matrix;

    /** Parameters express real value. */
    parameters: Map<string, number>;

    /** Parameters express string value. */
    texts: Map<string, string>;

    /** Copy this data. */
    copy(): IFireData;
}

export type TVector2D = {
    x: number,
    y: number,
};

export class FiringState implements IFiringState {
    fireData: IFireData;
    private readonly repeatStateStack: IRepeatState[];
    private readonly repeatMap: Map<string, IRepeatState[]>;

    constructor(readonly player: IPlayer) {
        this.fireData = new FireData();
        this.repeatStateStack = [{ finished: 0, total: 1 }];
        this.repeatMap = new Map();
    }

    copy(): FiringState {
        const clone = new FiringState(this.player);
        clone.fireData = this.fireData.copy();
        for (const rs of this.repeatStateStack) {
            clone.repeatStateStack.push(rs);
        }
        for (const [name, rs] of this.repeatMap) {
            clone.repeatMap.set(name, rs);
        }
        return clone;
    }

    private getLatestRepeatState(): IRepeatState {
        const idx = this.repeatStateStack.length - 1;
        return this.repeatStateStack[idx];
    }

    getRepeatState(name?: string): IRepeatState {
        if (name === undefined) return this.getLatestRepeatState();

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

export class FireData implements IFireData {
    /** Bullet spawning transform. */
    transform: mat.Matrix;

    /** Parameters express real value. */
    parameters: Map<string, number>;

    /** Parameters express string value. */
    texts: Map<string, string>;

    constructor() {
        this.transform = mat.translate(0);
        this.parameters = new Map();
        this.texts = new Map();
    }

    copy(): FireData {
        const clone = new FireData();
        clone.transform = mat.transform(this.transform);
        clone.parameters = copyMap(this.parameters);
        clone.texts = copyMap(this.texts);
        return clone;
    }

}

const copyMap = <T1, T2>(map: Map<T1, T2>): Map<T1, T2> => {
    const clone = new Map<T1, T2>();
    for (const [k, v] of map.entries()) {
        clone.set(k, v);
    }
    return clone;
};

export interface IGun {
    play(state: IFiringState): IterableIterator<void>;
}

/**
 * Bullet express property of bullet.
 */
export interface IBullet {}
