import * as mat from "transformation-matrix";
import { decomposeTransform } from "../../transform-util";
import { Muzzle, VirtualMuzzle, VirtualMuzzleGenerator } from "../../muzzle";
import {
  MuzzleTransOverrider,
  MuzzleTransformOverrideMuzzle
} from "./muzzle-transform-override-muzzle";

export const calcDirectionRad = (src: mat.Matrix, dest: mat.Matrix): number => {
  const [srcLoc, _, __] = decomposeTransform(src);

  const [destLoc, ___, ____] = decomposeTransform(dest);
  const muzzleToEnemy = {
    x: destLoc.x - srcLoc.x,
    y: destLoc.y - srcLoc.y
  };
  return Math.atan2(muzzleToEnemy.y, muzzleToEnemy.x);
};

/**
 * Aiming enemy every frame.
 */
class AimingOverride implements MuzzleTransOverrider {
  private basedMuzzle: Muzzle | null;

  public constructor() {
    this.basedMuzzle = null;
  }
  /**
   * Set basing muzzle.
   *
   * @param baseMuzzle basing muzzle
   */
  public basedOn(baseMuzzle: Muzzle): void {
    this.basedMuzzle = baseMuzzle;
  }

  /**
   * Get muzzle transform.
   */
  public getMuzzleTransform(): mat.Matrix {
    if (this.basedMuzzle === null) throw new Error("Not based on muzzle yet");
    const baseTrans = this.basedMuzzle.getMuzzleTransform();
    const enemyTrans = this.basedMuzzle.getEnemyTransform();
    const [loc, _, scale] = decomposeTransform(baseTrans);
    const aimDirectionRad = calcDirectionRad(baseTrans, enemyTrans);
    return mat.transform(
      mat.translate(loc.x, loc.y),
      mat.rotate(aimDirectionRad),
      mat.scale(scale.x, scale.y)
    );
  }
}

/**
 * Generate VirtualMuzzle aiming enemy every frame.
 */
export class AimingMuzzle implements VirtualMuzzleGenerator {
  /**
   * Generate virtual muzzle.
   */
  public generate(): VirtualMuzzle {
    return new MuzzleTransformOverrideMuzzle(new AimingOverride());
  }
}
