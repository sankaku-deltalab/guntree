import * as mat from "transformation-matrix";

import { Gun } from "../gun";
import { FiringState } from "../firing-state";
import {
  TConstantOrLazy,
  calcTransFormFromConstantOrLazy
} from "../lazyEvaluative";
import { FireData } from "guntree/fire-data";
import { Owner } from "guntree/owner";
import { PlayerLike } from "guntree/player";

export interface FireDataModifier {
  createModifier(state: FiringState): (fireData: FireData) => void;
}

/**
 * ModifierGun update FireData when fired.
 * Played before fire, and modify when fired.
 */
export class ModifierGun implements Gun {
  private readonly modifier: FireDataModifier;

  /**
   * @param modifier Used modifier
   */
  public constructor(modifier: FireDataModifier) {
    this.modifier = modifier;
  }

  public *play(
    _owner: Owner,
    player: PlayerLike,
    state: FiringState
  ): IterableIterator<void> {
    state.pushModifier(this.modifier.createModifier(state));
  }
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
 * Invert transform matrix.
 */
export class InvertTransformModifier implements FireDataModifier {
  public createModifier(_state: FiringState): (fireData: FireData) => void {
    return (fireData: FireData): void => {
      fireData.transform = mat.transform(mat.scale(1, -1), fireData.transform);
    };
  }
}

/**
 * Modify parameter with given function later.
 */
export class ModifyParameterModifier implements FireDataModifier {
  private readonly name: string;
  private readonly modifier: (
    state: FiringState
  ) => (oldValue: number) => number;

  public constructor(
    name: string,
    modifier: (state: FiringState) => (oldValue: number) => number
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
