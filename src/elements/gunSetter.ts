import { Gun } from "../gun";
import { FiringState } from "../firing-state";
import {
  TConstantOrLazy,
  calcValueFromConstantOrLazy
} from "../lazyEvaluative";
import { VirtualMuzzleGenerator } from "../muzzle";

export interface FiringStateUpdater {
  updateFiringState(state: FiringState): void;
}

/**
 * SetterGun update FiringState when played.
 */
export class SetterGun implements Gun {
  private readonly updater: FiringStateUpdater;

  /**
   * @param updater Used when played.
   */
  public constructor(updater: FiringStateUpdater) {
    this.updater = updater;
  }

  public *play(state: FiringState): IterableIterator<void> {
    this.updater.updateFiringState(state);
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

  public updateFiringState(state: FiringState): void {
    state.fireData.parameters.set(
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

  public updateFiringState(state: FiringState): void {
    state.fireData.texts.set(
      this.name,
      calcValueFromConstantOrLazy(state, this.text)
    );
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

  public updateFiringState(state: FiringState): void {
    const muzzleName = calcValueFromConstantOrLazy(state, this.name);
    state.muzzle = state.getMuzzleByName(muzzleName);
    state.fireData.muzzleName = muzzleName;
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

  public updateFiringState(state: FiringState): void {
    if (state.muzzle === null)
      throw new Error("Muzzle was not set at FiringState");
    const muzzle = this.virtualMuzzleGenerator.generate();
    muzzle.basedOn(state.muzzle);
    state.muzzle = muzzle;
  }
}
