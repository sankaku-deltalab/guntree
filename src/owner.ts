import * as mat from "transformation-matrix";
import { FireData } from "./fire-data";
import { Bullet } from "./bullet";

export interface Owner {
  /**
   * Fire bullet.
   *
   * @param data FireData when fired.
   * @param bullet Firing bullet.
   */
  fire(data: FireData, bullet: Bullet): void;

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
