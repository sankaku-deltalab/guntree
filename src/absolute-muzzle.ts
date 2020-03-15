import * as mat from "transformation-matrix";

import { Muzzle } from "./muzzle";

export class AbsoluteMuzzle implements Muzzle {
  /**
   * Get muzzle transform.
   */
  public getMuzzleTransform(): mat.Matrix {
    return mat.translate(0);
  }

  /**
   * Get enemy transform.
   */
  public getEnemyTransform(): mat.Matrix {
    return mat.translate(1, 0);
  }
}
