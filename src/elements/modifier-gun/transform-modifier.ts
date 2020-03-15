import * as mat from "transformation-matrix";

import { FiringState } from "../../firing-state";
import { FireData } from "guntree/fire-data";
import { FireDataModifier } from "./modifier-gun";
import {
  TConstantOrLazy,
  calcTransFormFromConstantOrLazy
} from "guntree/lazyEvaluative";

/**
 * Transform matrix.
 */
export class TransformModifier implements FireDataModifier {
  private readonly trans: TConstantOrLazy<mat.Matrix>;
  public constructor(trans: TConstantOrLazy<mat.Matrix>) {
    this.trans = trans;
  }

  public createModifier(state: FiringState): (fireData: FireData) => void {
    const transConst = calcTransFormFromConstantOrLazy(state, this.trans);

    return (fireData: FireData): void => {
      fireData.transform = mat.transform(transConst, fireData.transform);
    };
  }
}
