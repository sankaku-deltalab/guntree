import * as mat from "transformation-matrix";
import { copyMap } from "./util";

/**
 * FireData contains data used when bullet was fired.
 */
export class FireData {
  /** Bullet spawning transform. */
  public transform = mat.translate(0);

  /** Parameters express real value. */
  public parameters = new Map<string, number>();

  /** Parameters express string value. */
  public texts = new Map<string, string>();

  public copy(): FireData {
    const clone = new FireData();
    clone.transform = Object.assign({}, this.transform);
    clone.parameters = copyMap(this.parameters);
    clone.texts = copyMap(this.texts);
    return clone;
  }
}
