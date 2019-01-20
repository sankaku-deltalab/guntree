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
    /** Parameters express real value. */
    parameters: Map<string, Parameter>;

    /** Parameters express string value. */
    texts: Map<string, string>;

    /** Parameters express vector value. */
    vectors: Map<string, TVector2D>;

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

export type TVector2D = {
    x: number,
    y: number,
};

export class FiringState implements IFiringState {
    readonly parameters: Map<string, Parameter>;
    readonly texts: Map<string, string>;
    readonly vectors: Map<string, TVector2D>;
    private readonly repeatStateStack: IRepeatState[];
    private readonly repeatMap: Map<string, IRepeatState[]>;

    constructor(readonly player: IPlayer) {
        this.parameters = new Map();
        this.texts = new Map();
        this.repeatStateStack = [{ finished: 0, total: 1 }];
        this.repeatMap = new Map();
        this.vectors = new Map();
    }

    copy(): FiringState {
        const clone = new FiringState(this.player);
        for (const [key, param] of this.parameters) {
            clone.parameters.set(key, param.copy());
        }
        for (const [key, value] of this.texts) {
            clone.texts.set(key, value);
        }
        for (const [name, vec] of this.vectors) {
            clone.vectors.set(name, Object.assign({}, vec));
        }
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

export interface IGun {
    play(state: IFiringState): IterableIterator<void>;
}

/**
 * Bullet express property of bullet.
 */
export interface IBullet {}
