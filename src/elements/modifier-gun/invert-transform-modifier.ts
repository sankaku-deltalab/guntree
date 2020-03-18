import * as mat from "transformation-matrix";

import { FiringState } from "../../firing-state";
import { FireData } from "../../fire-data";
import { FireDataModifier } from "./modifier-gun";

/**
 * Invert transform matrix.
 */
export class InvertTransformModifier implements FireDataModifier {
  public createModifier(_state: FiringState): (fireData: FireData) => void {
    return (fireData: FireData): void => {
      fireData.transform = mat.transform(mat.scale(1, -1), fireData.transform);
    };
  }
}
