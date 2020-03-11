import { Gun } from "../gun";
import { FiringState } from "../firing-state";
import {
  TConstantOrLazy,
  calcValueFromConstantOrLazy
} from "../lazyEvaluative";
import { VirtualMuzzleGenerator } from "../muzzle";
import { RawMuzzle } from "guntree/raw-muzzle";
import { Owner } from "guntree/owner";

export interface FiringStateUpdater {
  updateFiringState(owner: Owner, state: FiringState): void;
}

/**
 * SetterGun update FiringState when played.
 * Played and effects before fired.
 */
export class SetterGun implements Gun {
  private readonly updater: FiringStateUpdater;

  /**
   * @param updater Used when played.
   */
  public constructor(updater: FiringStateUpdater) {
    this.updater = updater;
  }

  public *play(owner: Owner, state: FiringState): IterableIterator<void> {
    this.updater.updateFiringState(owner, state);
  }
}

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

/**
 * Attach virtual muzzle to current muzzle.
 */
export class AttachVirtualMuzzleUpdater implements FiringStateUpdater {
  private readonly virtualMuzzleGenerator: VirtualMuzzleGenerator;

  public constructor(virtualMuzzleGenerator: VirtualMuzzleGenerator) {
    this.virtualMuzzleGenerator = virtualMuzzleGenerator;
  }

  public updateFiringState(owner: Owner, state: FiringState): void {
    const muzzle = this.virtualMuzzleGenerator.generate();
    muzzle.basedOn(state.getMuzzle());
    state.setMuzzle(muzzle);
  }
}
