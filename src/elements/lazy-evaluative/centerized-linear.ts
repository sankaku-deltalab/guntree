import { FiringState } from "../../firing-state";
import {
  LazyEvaluative,
  TConstantOrLazy,
  calcValueFromConstantOrLazy
} from "../../lazyEvaluative";

/**
 * Deal centerized linear values.
 *
 * example:
 *
 * new CenterizedLinear(15)  // deal [-5, 0, 5] values when repeat 3 times
 */
export class CenterizedLinear implements LazyEvaluative<number> {
  private readonly totalRange: TConstantOrLazy<number>;
  private readonly target?: string;

  public constructor(totalRange: TConstantOrLazy<number>, target?: string) {
    this.totalRange = totalRange;
    this.target = target;
  }

  public calc(state: FiringState): number {
    const totalRange = calcValueFromConstantOrLazy(state, this.totalRange);
    const repeat = state.repeatStates.get(this.target);
    const rate = repeat.finished / repeat.total;
    const diff = totalRange / repeat.total;
    return totalRange * rate - (totalRange - diff) / 2;
  }
}
