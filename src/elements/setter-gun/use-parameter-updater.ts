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
