import * as mat from "transformation-matrix";

import { FiringState } from "../../firing-state";
import {
  LazyEvaluative,
  TConstantOrLazy,
  calcValueFromConstantOrLazy
} from "../../lazyEvaluative";

/**
 * Deal rounded value
 */
export class Round implements LazyEvaluative<number> {
  private readonly input: TConstantOrLazy<number>;
  /**
   *
   * @param input number or lazyEvaluative deals number
   */
  public constructor(input: TConstantOrLazy<number>) {
    this.input = input;
  }

  public calc(state: FiringState): number {
    if (typeof this.input === "number") return Math.round(this.input);
    return Math.round(this.input.calc(state));
  }
}
