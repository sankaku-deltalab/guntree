import { FiringState } from "../../firing-state";
import { Owner } from "../../owner";
import { FiringStateUpdater } from "./setter-gun";
import {
  TConstantOrLazy,
  calcValueFromConstantOrLazy
} from "../../lazyEvaluative";

/**
 * Use new parameter when played.
 */
export class UseParameterUpdater implements FiringStateUpdater {
  private readonly name: string;
  private readonly value: TConstantOrLazy<number>;

  public constructor(name: string, value: TConstantOrLazy<number>) {
    this.name = name;
    this.value = value;
  }

  public updateFiringState(_owner: Owner, state: FiringState): void {
    state.parameters.set(
      this.name,
      calcValueFromConstantOrLazy(state, this.value)
    );
  }
}
