import { FiringState } from "../../firing-state";
import { RawMuzzle } from "../../raw-muzzle";
import { Owner } from "../../owner";
import { FiringStateUpdater } from "./setter-gun";
import {
  TConstantOrLazy,
  calcValueFromConstantOrLazy
} from "../../lazyEvaluative";

/**
 * Use new muzzle when played.
 */
export class UseMuzzleUpdater implements FiringStateUpdater {
  private readonly name: TConstantOrLazy<string>;

  public constructor(name: TConstantOrLazy<string>) {
    this.name = name;
  }

  public updateFiringState(owner: Owner, state: FiringState): void {
    const muzzleName = calcValueFromConstantOrLazy(state, this.name);
    state.setMuzzle(new RawMuzzle(owner, muzzleName));
  }
}
