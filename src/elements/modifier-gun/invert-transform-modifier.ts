import * as mat from "transformation-matrix";

import { Gun } from "../../gun";
import { FiringState } from "../../firing-state";
import { FireData } from "guntree/fire-data";
import { Owner } from "guntree/owner";
import { PlayerLike } from "guntree/player";
import { FireDataModifier } from "./modifier-gun";
import {
  TConstantOrLazy,
  calcTransFormFromConstantOrLazy
} from "guntree/lazyEvaluative";

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
