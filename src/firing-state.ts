import * as mat from "transformation-matrix";

import { Player } from "./player";
import { Muzzle } from "./muzzle";
import { Bullet } from "./bullet";

/**
 * FiringState contains information while firing.
 */
export interface FiringState {
  /** Contain data used when fired. */
  fireData: FireData;

  /** Muzzle fire bullet */
  muzzle: Muzzle | null;

  /** Manager manage repeating while firing. */
  repeatStates: RepeatStateManager;

  /**
   * Push function would applied to fireData when fire bullet.
   *
   * @param modifier modifier would applied when fire bullet
   */
  pushModifier(
    modifier: (stateConst: FiringState, fireData: FireData) => void
  ): void;

  /** Calculate modified fire data. */
  calcModifiedFireData(): FireData;

  /**
   * Get muzzle by name.
   *
   * @param muzzleName Searching muzzle name
   */
  getMuzzleByName(muzzleName: string): Muzzle;

  /**
   * Fire bullet.
   * This function is called by guns.
   *
   * @param bullet Firing bullet
   */
  fire(bullet: Bullet): void;

  /** Copy this state. */
  copy(): FiringState;
}

/**
 * IFireData contains data used when bullet was fired.
 */
export interface FireData {
  /** Bullet spawning transform. */
  transform: mat.Matrix;

  /** Parameters express real value. */
  parameters: Map<string, number>;

  /** Parameters express string value. */
  texts: Map<string, string>;

  /** Using muzzle name. */
  muzzleName: string | null;

  /** Copy this data. */
  copy(): FireData;
}

/**
 * IRepeatStateManager manage repeating while firing.
 */
export interface RepeatStateManager {
  /**
   * Get repeat state with name.
   * If name is not given, return latest repeat state.
   * If not repeating, return { finished: 0, total: 1 }.
   *
   * @param name Repeating name
   */
  get(name?: string): RepeatState;

  /**
   * Notify start repeating.
   * Called by guns.
   * Return input repeat state.
   *
   * @param state Repeat state
   * @param name Repeat state name
   */
  start(state: RepeatState, name?: string): RepeatState;

  /**
   * Notify finish repeating.
   * Started repeating must be finished.
   *
   * @param state Repeat state
   * @param name Repeat state name
   */
  finish(state: RepeatState, name?: string): void;

  /** Copy states with manager. */
  copy(): RepeatStateManager;
}

export interface RepeatState {
  finished: number;
  total: number;
}

/**
 * FiringState contains information while firing.
 */
export class DefaultFiringState implements FiringState {
  /** Muzzle fire bullet */
  public muzzle: Muzzle | null;

  /** Function would applied to fireData when fire bullet, */
  private readonly modifiers: ((
    stateConst: FiringState,
    fireData: FireData
  ) => void)[];

  /** Player playing with this state */
  private readonly player: Player;

  /** Contain data used when fired */
  public fireData: FireData;

  /** Manager manage repeating while firing */
  public repeatStates: RepeatStateManager;

  /**
   * @param player Player playing with this state
   * @param fireData Contain data used when fired
   * @param repeatStates Manager manage repeating while firing
   */
  public constructor(
    player: Player,
    fireData: FireData,
    repeatStates: RepeatStateManager
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
  public pushModifier(
    modifier: (stateConst: FiringState, fireData: FireData) => void
  ): void {
    this.modifiers.push(modifier);
  }

  /** Calculate modified fire data. */
  public calcModifiedFireData(): FireData {
    if (this.muzzle === null) throw new Error("Muzzle was not set");
    const fdClone = this.fireData.copy();

    // Apply modifiers
    const reversedMods = [...this.modifiers].reverse();
    for (const mod of reversedMods) {
      mod(this, fdClone);
    }

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
  public getMuzzleByName(muzzleName: string): Muzzle {
    return this.player.getMuzzle(muzzleName);
  }

  /**
   * Fire bullet.
   * This function is called by guns.
   *
   * @param bullet Firing bullet
   */
  public fire(bullet: Bullet): void {
    if (this.muzzle === null) throw new Error("Muzzle was not set");
    const data = this.calcModifiedFireData();
    this.muzzle.fire(data, bullet);
  }

  public copy(): DefaultFiringState {
    const clone = new DefaultFiringState(
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

export class DefaultFireData implements FireData {
  /** Bullet spawning transform. */
  public transform: mat.Matrix;

  /** Muzzle name fire bullet */
  public muzzleName: string | null;

  /** Parameters express real value. */
  public parameters: Map<string, number>;

  /** Parameters express string value. */
  public texts: Map<string, string>;

  public constructor() {
    this.transform = mat.translate(0);
    this.muzzleName = null;
    this.parameters = new Map([
      ["speed", 1],
      ["size", 1]
    ]);
    this.texts = new Map();
  }

  public copy(): DefaultFireData {
    const clone = new DefaultFireData();
    clone.muzzleName = this.muzzleName;
    clone.transform = Object.assign({}, this.transform);
    clone.parameters = copyMap(this.parameters);
    clone.texts = copyMap(this.texts);
    return clone;
  }
}

export class DefaultRepeatStateManager implements RepeatStateManager {
  private repeatStateStack: RepeatState[];
  private repeatMap: Map<string, RepeatState[]>;

  public constructor() {
    this.repeatStateStack = [{ finished: 0, total: 1 }];
    this.repeatMap = new Map();
  }

  public get(name?: string): RepeatState {
    if (name === undefined) {
      return this.repeatStateStack[this.repeatStateStack.length - 1];
    }

    const rsStack = this.repeatMap.get(name);
    if (rsStack === undefined) throw new Error();
    return rsStack[rsStack.length - 1];
  }

  public start(state: RepeatState, name?: string): RepeatState {
    if (name !== undefined) {
      this.pushToMap(state, name);
    }

    this.repeatStateStack.push(state);
    return state;
  }

  private pushToMap(state: RepeatState, name: string): void {
    const stack = this.repeatMap.get(name);
    if (stack === undefined) {
      this.repeatMap.set(name, [state]);
    } else {
      stack.push(state);
    }
  }

  public finish(state: RepeatState, name?: string): void {
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

  private popFromMap(state: RepeatState, name: string): RepeatState {
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
  public copy(): DefaultRepeatStateManager {
    const clone = new DefaultRepeatStateManager();
    clone.repeatStateStack = [...this.repeatStateStack];
    clone.repeatMap = copyMap(this.repeatMap, (rsStack): RepeatState[] => [
      ...rsStack
    ]);
    return clone;
  }
}
