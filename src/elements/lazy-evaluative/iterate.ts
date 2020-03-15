import * as mat from "transformation-matrix";

import { FiringState } from "../../firing-state";
import {
  LazyEvaluative,
  TConstantOrLazy,
  calcValueFromConstantOrLazy
} from "../../lazyEvaluative";

export interface TIterateOption {
  /** Default value used if repeating is not in array */
  default?: number;

  /** Used for specifying repeat */
  target?: string;
}

/**
 * Iterate values in argument with repeating.
 */
export class Iterate implements LazyEvaluative<number> {
  private readonly array: TConstantOrLazy<number>[];
  private readonly option?: TIterateOption;
  /**
   *
   * @param array values iterated with repeating
   * @param option
   */
  public constructor(
    array: TConstantOrLazy<number>[],
    option?: TIterateOption
  ) {
    this.array = array;
    this.option = option;
  }

  public calc(state: FiringState): number {
    const target = this.option !== undefined ? this.option.target : undefined;
    const repeat = state.repeatStates.get(target);
    if (repeat.finished >= this.array.length) {
      if (this.option !== undefined && this.option.default !== undefined)
        return this.option.default;
      throw new Error(
        "Iterate expected repeating out of range but default value is not in option"
      );
    }
    const value = this.array[repeat.finished];
    if (typeof value === "number") return value;
    return value.calc(state);
  }
}
