import * as mat from "transformation-matrix";

/**
 * Owner inform game information to GunTree system.
 */
export interface Owner {
  /**
   * Get muzzle transform.
   *
   * @param name Name of muzzle
   */
  getMuzzleTransform(name: string): mat.Matrix;

  /**
   * Get enemy transform.
   *
   * @param name Name of muzzle
   */
  getEnemyTransform(name: string): mat.Matrix;
}
