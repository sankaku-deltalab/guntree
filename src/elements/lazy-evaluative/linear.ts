import * as mat from "transformation-matrix";

import { FiringState } from "../../firing-state";
import {
  LazyEvaluative,
  TConstantOrLazy,
  calcValueFromConstantOrLazy
} from "../../lazyEvaluative";

export class Linear implements LazyEvaluative<number> {
  private readonly start: TConstantOrLazy<number>;
  private readonly stop: TConstantOrLazy<number>;
  private readonly target?: string;

  public constructor(
    start: TConstantOrLazy<number>,
    stop: TConstantOrLazy<number>,
    target?: string
  ) {
    this.start = start;
    this.stop = stop;
    this.target = target;
  }

  public calc(state: FiringState): number {
    const start = calcValueFromConstantOrLazy(state, this.start);
    const stop = calcValueFromConstantOrLazy(state, this.stop);
    const repeat = state.repeatStates.get(this.target);
    const rate = repeat.finished / repeat.total;
    return stop * rate + start * (1 - rate);
  }
}
