import * as mat from "transformation-matrix";

/**
 * Muzzle presents firing location and angle.
 */
export interface Muzzle {
  /**
   * Get muzzle transform.
   */
  getMuzzleTransform(): mat.Matrix;

  /**
   * Get enemy transform.
   */
  getEnemyTransform(): mat.Matrix;
}

/**
 * VirtualMuzzle is used instead of real muzzle.
 * Real muzzle is defined by user and exist in game.
 * VirtualMuzzle exist in only guntree firing progress.
 * And VirtualMuzzle is based on another muzzle (real or virtual).
 * When use VirtualMuzzle in guntree, Must used through VirtualMuzzleGenerator.
 */
export interface VirtualMuzzle extends Muzzle {
  /**
   * Set basing muzzle.
   *
   * @param baseMuzzle basing muzzle
   */
  basedOn(baseMuzzle: Muzzle): void;
}

/**
 * Generate VirtualMuzzle.
 */
export interface VirtualMuzzleGenerator {
  /**
   * Generate virtual muzzle.
   */
  generate(): VirtualMuzzle;
}
