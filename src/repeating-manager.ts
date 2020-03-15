import { copyMap } from "./util";

export interface RepeatState {
  finished: number;
  total: number;
}

/**
 * RepeatStateManager manage repeating while firing.
 */
export class RepeatingManager {
  private repeatStateStack: RepeatState[];
  private repeatMap: Map<string, RepeatState[]>;

  public constructor() {
    this.repeatStateStack = [{ finished: 0, total: 1 }];
    this.repeatMap = new Map();
  }

  /**
   * Get repeat state with name.
   * If name is not given, return latest repeat state.
   * If not repeating, return { finished: 0, total: 1 }.
   *
   * @param name Repeating name
   */
  public get(name?: string): RepeatState {
    if (name === undefined) {
      return this.repeatStateStack[this.repeatStateStack.length - 1];
    }

    const rsStack = this.repeatMap.get(name);
    if (rsStack === undefined) throw new Error();
    return rsStack[rsStack.length - 1];
  }

  /**
   * Notify start repeating.
   * Called by guns.
   * Return input repeat state.
   *
   * @param state Repeat state
   * @param name Repeat state name
   */
  public start(state: RepeatState, name?: string): RepeatState {
    if (name !== undefined) {
      this.pushToMap(state, name);
    }

    this.repeatStateStack.push(state);
    return state;
  }

  /**
   * Notify finish repeating.
   * Started repeating must be finished.
   *
   * @param state Repeat state
   * @param name Repeat state name
   */
  private pushToMap(state: RepeatState, name: string): void {
    const stack = this.repeatMap.get(name);
    if (stack === undefined) {
      this.repeatMap.set(name, [state]);
    } else {
      stack.push(state);
    }
  }

  /** Copy states with manager. */
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

  /** Copy states. */
  public copy(): RepeatingManager {
    const clone = new RepeatingManager();
    clone.repeatStateStack = [...this.repeatStateStack];
    clone.repeatMap = copyMap(this.repeatMap, (rsStack): RepeatState[] => [
      ...rsStack
    ]);
    return clone;
  }
}
