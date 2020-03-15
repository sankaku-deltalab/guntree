import * as mat from "transformation-matrix";

import { FireData } from "./fire-data";
import { RepeatingManager } from "./repeating-manager";
import { Muzzle } from "./muzzle";
import { copyMap } from "./util";
import { AbsoluteMuzzle } from "./absolute-muzzle";

/**
 * FiringState contains information while firing.
 */
export class FiringState {
  /** Manager manage repeating while firing */
  public repeatStates: RepeatingManager;

  /** Parameters express real value. */
  public parameters = new Map<string, number>([
    ["speed", 1],
    ["size", 1]
  ]);

  /** Parameters express string value. */
  public texts = new Map<string, string>();

  /** Function would applied to fireData when fire bullet, */
  private readonly modifiers: ((fireData: FireData) => void)[] = [];

  /** Muzzle fire bullet */
  private muzzle: Muzzle;

  /**
   * @param player Player playing with this state
   * @param fireData Contain data used when fired
   * @param repeatStates Manager manage repeating while firing
   */
  public constructor(
    repeatStates = new RepeatingManager(),
    muzzle: Muzzle = new AbsoluteMuzzle()
  ) {
    this.muzzle = muzzle;
    this.repeatStates = repeatStates;
  }

  public getMuzzle(): Muzzle {
    if (!this.muzzle) throw new Error("Muzzle was not set");
    return this.muzzle;
  }

  public setMuzzle(muzzle: Muzzle): void {
    this.muzzle = muzzle;
  }

  /**
   * Push function would applied to fireData when fire bullet.
   *
   * @param modifier Function would applied when fire bullet
   */
  public pushModifier(modifier: (fireData: FireData) => void): void {
    this.modifiers.push(modifier);
  }

  /** Calculate modified fire data. */
  public modifyFireData(fireData: FireData): void {
    if (this.muzzle === null) throw new Error("Muzzle was not set");

    fireData.parameters = copyMap(this.parameters);
    fireData.texts = copyMap(this.texts);

    // Apply modifiers
    const reversedMods = [...this.modifiers].reverse();
    for (const mod of reversedMods) {
      mod(fireData);
    }

    // Apply muzzle transform
    fireData.transform = mat.transform(
      this.muzzle.getMuzzleTransform(),
      fireData.transform
    );
  }

  public copy(): FiringState {
    const clone = new FiringState(this.repeatStates.copy());
    clone.parameters = copyMap(this.parameters);
    clone.texts = copyMap(this.texts);
    clone.muzzle = this.muzzle;
    clone.modifiers.push(...this.modifiers);
    return clone;
  }
}
