import * as mat from "transformation-matrix";

import { FiringState } from "../../firing-state";
import {
  LazyEvaluative,
  TConstantOrLazy,
  calcValueFromConstantOrLazy
} from "../../lazyEvaluative";

export interface TCreateTransformOption {
  translation?:
    | TConstantOrLazy<number>
    | [TConstantOrLazy<number>, TConstantOrLazy<number>];
  rotationDeg?: TConstantOrLazy<number>;
  scale?:
    | TConstantOrLazy<number>
    | [TConstantOrLazy<number>, TConstantOrLazy<number>];
}

interface TCreateTransformOptionFilled {
  translation:
    | TConstantOrLazy<number>
    | [TConstantOrLazy<number>, TConstantOrLazy<number>];
  rotationDeg: TConstantOrLazy<number>;
  scale:
    | TConstantOrLazy<number>
    | [TConstantOrLazy<number>, TConstantOrLazy<number>];
}

const calcTupleLe = (
  state: FiringState,
  tuple: [TConstantOrLazy<number>, TConstantOrLazy<number>]
): [number, number | undefined] => {
  return [
    calcValueFromConstantOrLazy(state, tuple[0]),
    calcValueFromConstantOrLazy(state, tuple[1])
  ];
};

/**
 * Create transform.
 *
 * example:
 *
 * new CreateTransform({
 *     translation: [10, 0],
 *     rotationDeg: 90,
 *     scale: 1.25,
 * });
 */
export class CreateTransform implements LazyEvaluative<mat.Matrix> {
  private readonly option: TCreateTransformOptionFilled;

  /**
   * @param option Translation values
   */
  public constructor(option: TCreateTransformOption) {
    const defaultOption: TCreateTransformOptionFilled = {
      translation: 0,
      rotationDeg: 0,
      scale: 1
    };
    this.option = Object.assign(defaultOption, option);
  }

  public calc(state: FiringState): mat.Matrix {
    const tr: [number, number | undefined] = Array.isArray(
      this.option.translation
    )
      ? calcTupleLe(state, this.option.translation)
      : [
          calcValueFromConstantOrLazy(state, this.option.translation),
          undefined
        ];
    const rot = calcValueFromConstantOrLazy(state, this.option.rotationDeg);
    const sc: [number, number | undefined] = Array.isArray(this.option.scale)
      ? calcTupleLe(state, this.option.scale)
      : [calcValueFromConstantOrLazy(state, this.option.scale), undefined];
    return mat.transform(
      mat.translate(tr[0], tr[1]),
      mat.rotateDEG(rot),
      mat.scale(sc[0], sc[1])
    );
  }
}
