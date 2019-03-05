import * as mat from 'transformation-matrix';

import { IPlayer } from './player';
import { IMuzzle } from './muzzle';

/**
 * FiringState contains information while firing.
 */
export interface IFiringState {
    /** Contain data used when fired. */
    fireData: IFireData;

    /** Manager manage repeating while firing. */
    repeatStates: IRepeatStateManager;

    /**
     * Push function would applied to fireData when fire bullet.
     *
     * @param modifier Function would applied when fire bullet
     */
    pushModifier(modifier: TFireDataModifier): void;

    /** Calculate modified fire data. */
    calcModifiedFireData(): IFireData;

    /**
     * Get current using muzzle.
     * Muzzle name was defined in fireData.
     * If muzzle name was not set, throw error.
     */
    getCurrentMuzzle(): IMuzzle;

    /** Copy this state. */
    copy(): IFiringState;
}

/**
 * IFireData contains data used when bullet was fired.
 */
export interface IFireData {
    /** Bullet spawning transform. */
    transform: mat.Matrix;

    /** Muzzle name fire bullet */
    muzzle: string | null;

    /** Parameters express real value. */
    parameters: Map<string, number>;

    /** Parameters express string value. */
    texts: Map<string, string>;

    /** Copy this data. */
    copy(): IFireData;
}

export type TFireDataModifier = (stateConst: IFiringState, fireData: IFireData) => void;

/**
 * IRepeatStateManager manage repeating while firing.
 */
export interface IRepeatStateManager {
    /**
     * Get repeat state with name.
     * If name is not given, return latest repeat state.
     * If not repeating, return { finished: 0, total: 1 }.
     *
     * @param name Repeating name
     */
    get(name?: string): IRepeatState;

    /**
     * Notify start repeating.
     * Called by guns.
     * Return input repeat state.
     *
     * @param state Repeat state
     * @param name Repeat state name
     */
    start(state: IRepeatState, name?: string): IRepeatState;

    /**
     * Notify finish repeating.
     * Started repeating must be finished.
     *
     * @param state Repeat state
     * @param name Repeat state name
     */
    finish(state: IRepeatState, name?: string): void;

    /** Copy states with manager. */
    copy(): IRepeatStateManager;
}

export interface IRepeatState {
    finished: number;
    total: number;
}

/**
 * FiringState contains information while firing.
 */
export class FiringState implements IFiringState {
    /** Contain data used when fired. */
    fireData: IFireData;

    /** Manager manage repeating while firing. */
    repeatStates: IRepeatStateManager;

    /** Function would applied to fireData when fire bullet, */
    private readonly modifiers: TFireDataModifier[];

    constructor(private readonly player: IPlayer) {
        this.fireData = new FireData();
        this.repeatStates = new RepeatStateManager();
        this.modifiers = [];
    }

    /**
     * Push function would applied to fireData when fire bullet.
     *
     * @param modifier Function would applied when fire bullet
     */
    pushModifier(modifier: TFireDataModifier): void {
        this.modifiers.push(modifier);
    }

    /** Calculate modified fire data. */
    calcModifiedFireData(): IFireData {
        const fdClone = this.fireData.copy();
        this.modifiers.reverse().map(mod => mod(this, fdClone));
        return fdClone;
    }

    /**
     * Get current using muzzle.
     * Muzzle name was defined in fireData.
     * If muzzle name was not set, throw error.
     */
    getCurrentMuzzle(): IMuzzle {
        if (this.fireData.muzzle === null) throw new Error('Muzzle was not used.');
        return this.player.getMuzzle(this.fireData.muzzle);
    }

    copy(): FiringState {
        const clone = new FiringState(this.player);
        clone.fireData = this.fireData.copy();
        clone.repeatStates = this.repeatStates.copy();
        return clone;
    }
}

export class FireData implements IFireData {
    /** Bullet spawning transform. */
    transform: mat.Matrix;

    /** Muzzle name fire bullet */
    muzzle: string | null;

    /** Parameters express real value. */
    parameters: Map<string, number>;

    /** Parameters express string value. */
    texts: Map<string, string>;

    constructor() {
        this.transform = mat.translate(0);
        this.muzzle = null;
        this.parameters = new Map();
        this.texts = new Map();
    }

    copy(): FireData {
        const clone = new FireData();
        clone.transform = Object.assign({}, this.transform);
        clone.parameters = copyMap(this.parameters);
        clone.texts = copyMap(this.texts);
        return clone;
    }

}

export class RepeatStateManager implements IRepeatStateManager {
    private repeatStateStack: IRepeatState[];
    private repeatMap: Map<string, IRepeatState[]>;

    constructor() {
        this.repeatStateStack = [{ finished: 0, total: 1 }];
        this.repeatMap = new Map();
    }

    get(name?: string): IRepeatState {
        if (name === undefined) {
            return this.repeatStateStack[this.repeatStateStack.length - 1];
        }

        const rsStack = this.repeatMap.get(name);
        if (rsStack === undefined) throw new Error();
        return rsStack[rsStack.length - 1];
    }

    start(state: IRepeatState, name?: string): IRepeatState {
        if (name !== undefined) {
            this.pushToMap(state, name);
        }

        this.repeatStateStack.push(state);
        return state;
    }

    private pushToMap(state: IRepeatState, name: string): void {
        const stack = this.repeatMap.get(name);
        if (stack === undefined) {
            this.repeatMap.set(name, [state]);
        } else {
            stack.push(state);
        }
    }

    finish(state: IRepeatState, name?: string): void {
        if (name !== undefined) {
            this.popFromMap(state, name);
        }

        if (this.repeatStateStack.length === 1) {  // First repeating is always [0, 1].
            throw new Error('Repeating was finished but all repeating was already finished');
        }
        const rs = this.repeatStateStack.pop();
        if (rs !== state) throw new Error('Finished repeating is not current repeating');
    }

    private popFromMap(state: IRepeatState, name: string) {
        const stack = this.repeatMap.get(name);
        if (stack === undefined) throw new Error(`repeating <${name}> is finished but not started repeating`);
        if (stack.length === 0) throw new Error(`repeating <${name}> is finished but already finished`);

        const rs = stack.pop();
        if (rs !== state) throw new Error(`Current repeating is not <${name}> but it is finished now`);
        return rs;
    }

    /** Copy states with manager. */
    copy(): RepeatStateManager {
        const clone = new RepeatStateManager();
        clone.repeatStateStack = [...this.repeatStateStack];
        clone.repeatMap = copyMap(this.repeatMap, rsStack => [...rsStack]);
        return clone;
    }
}

const copyMap = <T1, T2>(map: Map<T1, T2>, applier?: (value: T2) => T2): Map<T1, T2> => {
    const clone = new Map<T1, T2>();
    for (const [k, rawValue] of map.entries()) {
        const value = applier === undefined ? rawValue : applier(rawValue);
        clone.set(k, value);
    }
    return clone;
};
