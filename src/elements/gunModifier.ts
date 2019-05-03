import * as mat from "transformation-matrix";

import { Gun } from "../gun";
import { FiringState, FireDataModifier, FireData } from "../firing-state";
import {
  TConstantOrLazy,
  calcValueFromConstantOrLazy,
  calcTransFormFromConstantOrLazy
} from "../lazyEvaluative";
import { VirtualMuzzleGenerator } from "../muzzle";
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
    if (modifyLater) {
      state.pushModifier(modifier);
    } else {
      modifier.modifyFireData(state, state.fireData);
    }
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

  public modifyFireData(stateConst: FiringState, fireData: FireData): void {
    const transConst = calcTransFormFromConstantOrLazy(stateConst, this.trans);
    fireData.transform = mat.transform(transConst, fireData.transform);
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

  public modifyFireData(stateConst: FiringState, fireData: FireData): void {
    const [t, angleDeg, scale] = decomposeTransform(fireData.transform);
    const xRate = this.option.translationX ? -1 : 1;
    const yRate = this.option.translationY ? -1 : 1;
    const angleRate = this.option.angle ? -1 : 1;
    const translateNew = { x: t.x * xRate, y: t.y * yRate };
    const angleDegNew = angleDeg * angleRate;
    fireData.transform = mat.transform(
      mat.translate(translateNew.x, translateNew.y),
      mat.rotateDEG(angleDegNew),
      mat.scale(scale.x, scale.y)
    );
  }
}

/**
 * Set parameter in FireData when played.
 */
export class SetParameterImmediatelyModifier implements FireDataModifier {
  private readonly name: string;
  private readonly value: TConstantOrLazy<number>;

  public constructor(name: string, value: TConstantOrLazy<number>) {
    this.name = name;
    this.value = value;
  }

  public modifyFireData(stateConst: FiringState, fireData: FireData): void {
    fireData.parameters.set(
      this.name,
      calcValueFromConstantOrLazy(stateConst, this.value)
    );
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

  public modifyFireData(stateConst: FiringState, fireData: FireData): void {
    const oldValue = fireData.parameters.get(this.name);
    if (oldValue === undefined)
      throw new Error(`parameter <${this.name}> was not set`);
    fireData.parameters.set(this.name, this.modifier(stateConst, oldValue));
  }
}

/**
 * Set text in FireData when played.
 */
export class SetTextImmediatelyModifier implements FireDataModifier {
  private readonly name: string;
  private readonly text: TConstantOrLazy<string>;

  public constructor(name: string, text: TConstantOrLazy<string>) {
    this.name = name;
    this.text = text;
  }

  public modifyFireData(stateConst: FiringState, fireData: FireData): void {
    fireData.texts.set(
      this.name,
      calcValueFromConstantOrLazy(stateConst, this.text)
    );
  }
}

/**
 * Set muzzle in FireData when played.
 */
export class SetMuzzleImmediatelyModifier implements FireDataModifier {
  private readonly name: TConstantOrLazy<string>;

  public constructor(name: TConstantOrLazy<string>) {
    this.name = name;
  }

  public modifyFireData(stateConst: FiringState, _fireData: FireData): void {
    const muzzleName = calcValueFromConstantOrLazy(stateConst, this.name);
    stateConst.muzzle = stateConst.getMuzzleByName(muzzleName);
  }
}

/**
 * Attach virtual muzzle to current muzzle.
 */
export class AttachVirtualMuzzleImmediatelyModifier
  implements FireDataModifier {
  private readonly virtualMuzzleGenerator: VirtualMuzzleGenerator;

  public constructor(virtualMuzzleGenerator: VirtualMuzzleGenerator) {
    this.virtualMuzzleGenerator = virtualMuzzleGenerator;
  }

  public modifyFireData(stateConst: FiringState, _fireData: FireData): void {
    if (stateConst.muzzle === null)
      throw new Error("Muzzle was not set at FiringState");
    const muzzle = this.virtualMuzzleGenerator.generate();
    muzzle.basedOn(stateConst.muzzle);
    stateConst.muzzle = muzzle;
  }
}
