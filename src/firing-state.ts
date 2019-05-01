import * as mat from "transformation-matrix";

import { IPlayer } from "./player";
import { IMuzzle } from "./muzzle";
import { IBullet } from ".";

/**
 * FiringState contains information while firing.
 */
export interface IFiringState {
  /** Contain data used when fired. */
  fireData: IFireData;

  /** Muzzle fire bullet */
  muzzle: IMuzzle | null;

  /** Manager manage repeating while firing. */
  repeatStates: IRepeatStateManager;

  /**
   * Push function would applied to fireData when fire bullet.
   *
   * @param modifier modifier would applied when fire bullet
   */
  pushModifier(modifier: IFireDataModifier): void;

  /** Calculate modified fire data. */
  calcModifiedFireData(): IFireData;

  /**
   * Get muzzle by name.
   *
   * @param muzzleName Searching muzzle name
   */
  getMuzzleByName(muzzleName: string): IMuzzle;

  /**
   * Fire bullet.
   * This function is called by guns.
   *
   * @param bullet Firing bullet
   */
  fire(bullet: IBullet): void;

  /** Copy this state. */
  copy(): IFiringState;
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

/**
 * IFireDataModifier modify FireData.
 */
export interface IFireDataModifier {
  modifyFireData(stateConst: IFiringState, fireData: IFireData): void;
}

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
  /** Muzzle fire bullet */
  public muzzle: IMuzzle | null;

  /** Function would applied to fireData when fire bullet, */
  private readonly modifiers: IFireDataModifier[];

  /** Player playing with this state */
  private readonly player: IPlayer;

  /** Contain data used when fired */
  public fireData: IFireData;

  /** Manager manage repeating while firing */
  public repeatStates: IRepeatStateManager;

  /**
   * @param player Player playing with this state
   * @param fireData Contain data used when fired
   * @param repeatStates Manager manage repeating while firing
   */
  public constructor(
    player: IPlayer,
    fireData: IFireData,
    repeatStates: IRepeatStateManager
  ) {
    this.muzzle = null;
    this.modifiers = [];
    this.player = player;
    this.fireData = fireData;
    this.repeatStates = repeatStates;
  }

  /**
   * Push function would applied to fireData when fire bullet.
   *
   * @param modifier Function would applied when fire bullet
   */
  public pushModifier(modifier: IFireDataModifier): void {
    this.modifiers.push(modifier);
  }

  /** Calculate modified fire data. */
  public calcModifiedFireData(): IFireData {
    if (this.muzzle === null) throw new Error("Muzzle was not set");
    const fdClone = this.fireData.copy();

    // Apply modifiers
    this.modifiers
      .reverse()
      .map((mod): void => mod.modifyFireData(this, fdClone));

    // Apply muzzle transform
    fdClone.transform = mat.transform(
      this.muzzle.getMuzzleTransform(),
      fdClone.transform
    );

    return fdClone;
  }

  /**
   * Get muzzle by name.
   *
   * @param muzzleName Searching muzzle name
   */
  public getMuzzleByName(muzzleName: string): IMuzzle {
    return this.player.getMuzzle(muzzleName);
  }

  /**
   * Fire bullet.
   * This function is called by guns.
   *
   * @param bullet Firing bullet
   */
  public fire(bullet: IBullet): void {
    if (this.muzzle === null) throw new Error("Muzzle was not set");
    const data = this.calcModifiedFireData();
    this.muzzle.fire(data, bullet);
  }

  public copy(): FiringState {
    const clone = new FiringState(
      this.player,
      this.fireData.copy(),
      this.repeatStates.copy()
    );
    clone.muzzle = this.muzzle;
    clone.modifiers.push(...this.modifiers);
    return clone;
  }
}

const copyMap = <T1, T2>(
  map: Map<T1, T2>,
  applier?: (value: T2) => T2
): Map<T1, T2> => {
  const clone = new Map<T1, T2>();
  for (const [k, rawValue] of map.entries()) {
    const value = applier === undefined ? rawValue : applier(rawValue);
    clone.set(k, value);
  }
  return clone;
};

export class FireData implements IFireData {
  /** Bullet spawning transform. */
  public transform: mat.Matrix;

  /** Muzzle name fire bullet */
  public muzzle: IMuzzle | null;

  /** Parameters express real value. */
  public parameters: Map<string, number>;

  /** Parameters express string value. */
  public texts: Map<string, string>;

  public constructor() {
    this.transform = mat.translate(0);
    this.muzzle = null;
    this.parameters = new Map([["speed", 1], ["size", 1]]);
    this.texts = new Map();
  }

  public copy(): FireData {
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

  public constructor() {
    this.repeatStateStack = [{ finished: 0, total: 1 }];
    this.repeatMap = new Map();
  }

  public get(name?: string): IRepeatState {
    if (name === undefined) {
      return this.repeatStateStack[this.repeatStateStack.length - 1];
    }

    const rsStack = this.repeatMap.get(name);
    if (rsStack === undefined) throw new Error();
    return rsStack[rsStack.length - 1];
  }

  public start(state: IRepeatState, name?: string): IRepeatState {
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

  public finish(state: IRepeatState, name?: string): void {
    if (name !== undefined) {
      this.popFromMap(state, name);
    }

    if (this.repeatStateStack.length === 1) {
      // First repeating is always [0, 1].
      throw new Error(
        "Repeating was finished but all repeating was already finished"
      );
    }
    const rs = this.repeatStateStack.pop();
    if (rs !== state)
      throw new Error("Finished repeating is not current repeating");
  }

  private popFromMap(state: IRepeatState, name: string): IRepeatState {
    const stack = this.repeatMap.get(name);
    if (stack === undefined)
      throw new Error(
        `repeating <${name}> is finished but not started repeating`
      );
    if (stack.length === 0)
      throw new Error(`repeating <${name}> is finished but already finished`);

    const rs = stack.pop();
    if (rs !== state)
      throw new Error(
        `Current repeating is not <${name}> but it is finished now`
      );
    return rs;
  }

  /** Copy states with manager. */
  public copy(): RepeatStateManager {
    const clone = new RepeatStateManager();
    clone.repeatStateStack = [...this.repeatStateStack];
    clone.repeatMap = copyMap(
      this.repeatMap,
      (rsStack): IRepeatState[] => [...rsStack]
    );
    return clone;
  }
}
