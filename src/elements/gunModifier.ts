import * as mat from "transformation-matrix";

import { Gun } from "../gun";
import { FiringState, FireData } from "../firing-state";
import {
  TConstantOrLazy,
  calcTransFormFromConstantOrLazy
} from "../lazyEvaluative";
import { decomposeTransform } from "../transform-util";

/**
 * ModifierGun update FireData when fired.
 */
export class ModifierGun implements Gun {
  private readonly modifier: FireDataModifier;

  /**
   * @param modifier Used modifier
   */
  public constructor(modifier: FireDataModifier) {
    this.modifier = modifier;
  }

  public *play(state: FiringState): IterableIterator<void> {
    state.pushModifier(this.modifier.createModifier(state));
  }
}

export interface FireDataModifier {
  createModifier(state: FiringState): (fireData: FireData) => void;
}

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

/**
 * Invert option.
 */
export interface TInvertTransformOption {
  /** Invert angle. */
  angle?: true;
  /** Invert translation x. */
  translationX?: true;
  /** Invert translation y. */
  translationY?: true;
}

/**
 * Invert transform matrix.
 */
export class InvertTransformModifier implements FireDataModifier {
  private readonly option: TInvertTransformOption;
  public constructor(option: TInvertTransformOption) {
    this.option = option;
  }

  public createModifier(_state: FiringState): (fireData: FireData) => void {
    const xRate = this.option.translationX ? -1 : 1;
    const yRate = this.option.translationY ? -1 : 1;
    const angleRate = this.option.angle ? -1 : 1;

    return (fireData: FireData): void => {
      const [t, angleDeg, scale] = decomposeTransform(fireData.transform);
      const translateNew = { x: t.x * xRate, y: t.y * yRate };
      const angleDegNew = angleDeg * angleRate;
      fireData.transform = mat.transform(
        mat.translate(translateNew.x, translateNew.y),
        mat.rotateDEG(angleDegNew),
        mat.scale(scale.x, scale.y)
      );
    };
  }
}

/**
 * Modify parameter with given function later.
 */
export class ModifyParameterModifier implements FireDataModifier {
  private readonly name: string;
  private readonly modifier: (
    stateConst: FiringState
  ) => (oldValue: number) => number;

  public constructor(
    name: string,
    modifier: (stateConst: FiringState) => (oldValue: number) => number
  ) {
    this.name = name;
    this.modifier = modifier;
  }

  public createModifier(state: FiringState): (fireData: FireData) => void {
    const mod = this.modifier(state);
    return (fireData: FireData): void => {
      const oldValue = fireData.parameters.get(this.name);
      if (oldValue === undefined)
        throw new Error(`parameter <${this.name}> was not set`);
      fireData.parameters.set(this.name, mod(oldValue));
    };
  }
}
