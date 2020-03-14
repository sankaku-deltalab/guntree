import * as mat from "transformation-matrix";

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
