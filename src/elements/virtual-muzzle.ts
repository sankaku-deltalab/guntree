import * as mat from "transformation-matrix";

import { decomposeTransform } from "../transform-util";
import { FireData } from "../firing-state";
import { Bullet } from "../bullet";
import { Muzzle, VirtualMuzzle, VirtualMuzzleGenerator } from "../muzzle";

/**
 * VirtualMuzzle modify only muzzle transform.
 */
class MuzzleTransformOverrideMuzzle implements VirtualMuzzle {
  private basedMuzzle: Muzzle | null;
  private readonly override: MuzzleTransOverrider;

  public constructor(override: MuzzleTransOverrider) {
    this.override = override;
    this.basedMuzzle = null;
  }

  /**
   * Fire bullet.
   *
   * @param data FireData when fired.
   * @param bullet Firing bullet.
   */
  public fire(data: FireData, bullet: Bullet): void {
    this.getBasedMuzzle().fire(data, bullet);
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

/**
 * This override MuzzleTransform of muzzle.
 * Used for MuzzleTransformOverrideMuzzle.
 */
interface MuzzleTransOverrider {
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

const calcDirectionRad = (src: mat.Matrix, dest: mat.Matrix): number => {
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
