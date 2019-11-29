import * as mat from "transformation-matrix";

import { Gun } from "../gun";
import { FiringState, FireData } from "../firing-state";
import {
  TConstantOrLazy,
  calcTransFormFromConstantOrLazy
} from "../lazyEvaluative";
import { decomposeTransform } from "../transform-util";

/**
 * ModifierGun update FireData when fired or immediately.
 */
export class ModifierGun implements Gun {
  private readonly modifyLater: boolean;
  private readonly modifier: FireDataModifier;
  /**
   * @param modifyLater Use modifier later or immediately
   * @param modifier Used modifier
   */
  public constructor(modifyLater: boolean, modifier: FireDataModifier) {
    this.modifyLater = modifyLater;
    this.modifier = modifier;
  }

  public *play(state: FiringState): IterableIterator<void> {
    ModifierGun.modifyImmediatelyOrLater(
      state,
      this.modifyLater,
      this.modifier
    );
  }

  private static modifyImmediatelyOrLater(
    state: FiringState,
    modifyLater: boolean,
    modifier: FireDataModifier
  ): void {
    const mod = modifier.createModifier(state);
    if (modifyLater) {
      state.pushModifier(mod);
    } else {
      mod(state, state.fireData);
    }
  }
}

export interface FireDataModifier {
  createModifier(
    state: FiringState
  ): (stateConst: FiringState, fireData: FireData) => void;
}

/**
 * Transform matrix.
 */
export class TransformModifier implements FireDataModifier {
  private readonly trans: TConstantOrLazy<mat.Matrix>;
  public constructor(trans: TConstantOrLazy<mat.Matrix>) {
    this.trans = trans;
  }

  public createModifier(
    state: FiringState
  ): (stateConst: FiringState, fireData: FireData) => void {
    const transConst = calcTransFormFromConstantOrLazy(state, this.trans);

    return (_stateConst: FiringState, fireData: FireData): void => {
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

  public createModifier(
    state: FiringState
  ): (stateConst: FiringState, fireData: FireData) => void {
    const [t, angleDeg, scale] = decomposeTransform(state.fireData.transform);
    const xRate = this.option.translationX ? -1 : 1;
    const yRate = this.option.translationY ? -1 : 1;
    const angleRate = this.option.angle ? -1 : 1;
    const translateNew = { x: t.x * xRate, y: t.y * yRate };
    const angleDegNew = angleDeg * angleRate;

    return (_stateConst: FiringState, fireData: FireData): void => {
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
    stateConst: FiringState,
    oldValue: number
  ) => number;

  public constructor(
    name: string,
    modifier: (stateConst: FiringState, oldValue: number) => number
  ) {
    this.name = name;
    this.modifier = modifier;
  }

  public createModifier(
    _state: FiringState
  ): (stateConst: FiringState, fireData: FireData) => void {
    return (stateConst: FiringState, fireData: FireData): void => {
      const oldValue = fireData.parameters.get(this.name);
      if (oldValue === undefined)
        throw new Error(`parameter <${this.name}> was not set`);
      fireData.parameters.set(this.name, this.modifier(stateConst, oldValue));
    };
  }
}
