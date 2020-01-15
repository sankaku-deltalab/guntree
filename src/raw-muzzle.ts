import * as mat from "transformation-matrix";

import { Muzzle } from "./muzzle";
import { Owner } from "./owner";
import { FireData } from "./firing-state";
import { Bullet } from "./bullet";

export class RawMuzzle implements Muzzle {
  private readonly owner: Owner;
  private readonly name: string;

  constructor(owner: Owner, name: string) {
    this.owner = owner;
    this.name = name;
  }

  /**
   * Fire bullet.
   *
   * @param data FireData when fired.
   * @param bullet Firing bullet.
   */
  public fire(data: FireData, bullet: Bullet): void {
    this.owner.fire(data, bullet);
  }

  /**
   * Get muzzle transform.
   */
  public getMuzzleTransform(): mat.Matrix {
    return this.owner.getMuzzleTransform(this.name);
  }

  /**
   * Get enemy transform.
   */
  public getEnemyTransform(): mat.Matrix {
    return this.owner.getEnemyTransform(this.name);
  }
}
