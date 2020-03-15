import { Gun } from "../../gun";
import { FiringState } from "../../firing-state";
import { VirtualMuzzleGenerator } from "../../muzzle";
import { RawMuzzle } from "guntree/raw-muzzle";
import { Owner } from "guntree/owner";
import { PlayerLike } from "guntree/player";
import { FiringStateUpdater } from "./setter-gun";
import {
  TConstantOrLazy,
  calcValueFromConstantOrLazy
} from "guntree/lazyEvaluative";

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
