import * as mat from "transformation-matrix";

import { decomposeTransform } from "../transform-util";
import { IFireData } from "../firing-state";
import { IBullet } from "../gun";
import { IMuzzle, IVirtualMuzzle, IVirtualMuzzleGenerator } from "../muzzle";

/**
 * VirtualMuzzle modify only muzzle transform.
 */
class MuzzleTransformOverrideMuzzle implements IVirtualMuzzle {
  private basedMuzzle: IMuzzle | null;
  private readonly override: IMuzzleTransOverride;

  public constructor(override: IMuzzleTransOverride) {
    this.override = override;
    this.basedMuzzle = null;
  }

  /**
   * Fire bullet.
   *
   * @param data FireData when fired.
   * @param bullet Firing bullet.
   */
  public fire(data: IFireData, bullet: IBullet): void {
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
  public basedOn(baseMuzzle: IMuzzle): void {
    this.basedMuzzle = baseMuzzle;
    this.override.basedOn(baseMuzzle);
  }

  private getBasedMuzzle(): IMuzzle {
    if (this.basedMuzzle === null) throw new Error("Not based on muzzle yet");
    return this.basedMuzzle;
  }
}

/**
 * This override MuzzleTransform of muzzle.
 * Used for MuzzleTransformOverrideMuzzle.
 */
interface IMuzzleTransOverride {
  /**
   * Set basing muzzle.
   *
   * @param baseMuzzle basing muzzle
   */
  basedOn(baseMuzzle: IMuzzle): void;

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
class AimingOverride implements IMuzzleTransOverride {
  private basedMuzzle: IMuzzle | null;

  public constructor() {
    this.basedMuzzle = null;
  }
  /**
   * Set basing muzzle.
   *
   * @param baseMuzzle basing muzzle
   */
  public basedOn(baseMuzzle: IMuzzle): void {
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
class FixedAimOverride implements IMuzzleTransOverride {
  private basedMuzzle: IMuzzle | null;
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
  public basedOn(baseMuzzle: IMuzzle): void {
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
export class AimingMuzzle implements IVirtualMuzzleGenerator {
  /**
   * Generate virtual muzzle.
   */
  public generate(): IVirtualMuzzle {
    return new MuzzleTransformOverrideMuzzle(new AimingOverride());
  }
}

/**
 * Generate VirtualMuzzle aim enemy at used frame.
 */
export class FixedAimMuzzle implements IVirtualMuzzleGenerator {
  /**
   * Generate virtual muzzle.
   */
  public generate(): IVirtualMuzzle {
    return new MuzzleTransformOverrideMuzzle(new FixedAimOverride());
  }
}
