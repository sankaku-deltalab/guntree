import * as mat from "transformation-matrix";
import { decomposeTransform } from "../../transform-util";
import { Muzzle, VirtualMuzzle, VirtualMuzzleGenerator } from "../../muzzle";
import {
  MuzzleTransOverrider,
  MuzzleTransformOverrideMuzzle
} from "./muzzle-transform-override-muzzle";
import { calcDirectionRad } from "./aiming-muzzle";

/**
 * Aim enemy at used frame.
 */
class FixedAimOverride implements MuzzleTransOverrider {
  private basedMuzzle: Muzzle | null;
  private aimingAngleRad: number;
  public constructor() {
    this.basedMuzzle = null;
    this.aimingAngleRad = 0;
  }
  /**
   * Set basing muzzle.
   *
   * @param baseMuzzle basing muzzle
   */
  public basedOn(baseMuzzle: Muzzle): void {
    this.basedMuzzle = baseMuzzle;

    // Set aiming angle
    const baseTrans = this.basedMuzzle.getMuzzleTransform();
    const enemyTrans = this.basedMuzzle.getEnemyTransform();
    this.aimingAngleRad = calcDirectionRad(baseTrans, enemyTrans);
  }

  /**
   * Get muzzle transform.
   */
  public getMuzzleTransform(): mat.Matrix {
    if (this.basedMuzzle === null) throw new Error("Not based on muzzle yet");
    const baseTrans = this.basedMuzzle.getMuzzleTransform();
    const [loc, _, scale] = decomposeTransform(baseTrans);
    return mat.transform(
      mat.translate(loc.x, loc.y),
      mat.rotate(this.aimingAngleRad),
      mat.scale(scale.x, scale.y)
    );
  }
}

/**
 * Generate VirtualMuzzle aim enemy at used frame.
 */
export class FixedAimMuzzle implements VirtualMuzzleGenerator {
  /**
   * Generate virtual muzzle.
   */
  public generate(): VirtualMuzzle {
    return new MuzzleTransformOverrideMuzzle(new FixedAimOverride());
  }
}
