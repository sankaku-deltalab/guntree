import { FiringState } from "../../firing-state";
import { Owner } from "../../owner";
import { FiringStateUpdater } from "./setter-gun";
import {
  TConstantOrLazy,
  calcValueFromConstantOrLazy
} from "../../lazyEvaluative";

/**
 * Use new text when played.
 */
export class UseTextUpdater implements FiringStateUpdater {
  private readonly name: string;
  private readonly text: TConstantOrLazy<string>;

  public constructor(name: string, text: TConstantOrLazy<string>) {
    this.name = name;
    this.text = text;
  }

  public updateFiringState(_owner: Owner, state: FiringState): void {
    state.texts.set(this.name, calcValueFromConstantOrLazy(state, this.text));
  }
}
