import * as mat from "transformation-matrix";
import { Muzzle, VirtualMuzzle } from "../../muzzle";

/**
 * This override MuzzleTransform of muzzle.
 * Used for MuzzleTransformOverrideMuzzle.
 */
export interface MuzzleTransOverrider {
  /**
   * Set basing muzzle.
   *
   * @param baseMuzzle basing muzzle
   */
  basedOn(baseMuzzle: Muzzle): void;

  /**
   * Get muzzle transform.
   */
  getMuzzleTransform(): mat.Matrix;
}

/**
 * VirtualMuzzle modify only muzzle transform.
 */
export class MuzzleTransformOverrideMuzzle implements VirtualMuzzle {
  private basedMuzzle: Muzzle | null;
  private readonly override: MuzzleTransOverrider;

  public constructor(override: MuzzleTransOverrider) {
    this.override = override;
    this.basedMuzzle = null;
  }

  /**
   * Get muzzle transform.
   */
  public getMuzzleTransform(): mat.Matrix {
    return this.override.getMuzzleTransform();
  }

  /**
   * Get enemy transform.
   */
  public getEnemyTransform(): mat.Matrix {
    return this.getBasedMuzzle().getEnemyTransform();
  }

  /**
   * Set basing muzzle.
   *
   * @param baseMuzzle basing muzzle
   */
  public basedOn(baseMuzzle: Muzzle): void {
    this.basedMuzzle = baseMuzzle;
    this.override.basedOn(baseMuzzle);
  }

  private getBasedMuzzle(): Muzzle {
    if (this.basedMuzzle === null) throw new Error("Not based on muzzle yet");
    return this.basedMuzzle;
  }
}
