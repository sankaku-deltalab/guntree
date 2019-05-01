import * as mat from "transformation-matrix";

import { IGun } from "../gun";
import { IFiringState, IFireDataModifier, IFireData } from "../firing-state";
import {
  TConstantOrLazy,
  calcValueFromConstantOrLazy,
  calcTransFormFromConstantOrLazy
} from "../lazyEvaluative";
import { IVirtualMuzzleGenerator } from "../muzzle";
import { decomposeTransform } from "../transform-util";

/**
 * ModifierGun update FireData when fired or immediately.
 */
export class ModifierGun implements IGun {
  private readonly modifyLater: boolean;
  private readonly modifier: IFireDataModifier;
  /**
   * @param modifyLater Use modifier later or immediately
   * @param modifier Used modifier
   */
  public constructor(modifyLater: boolean, modifier: IFireDataModifier) {
    this.modifyLater = modifyLater;
    this.modifier = modifier;
  }

  public *play(state: IFiringState): IterableIterator<void> {
    ModifierGun.modifyImmediatelyOrLater(
      state,
      this.modifyLater,
      this.modifier
    );
  }

  private static modifyImmediatelyOrLater(
    state: IFiringState,
    modifyLater: boolean,
    modifier: IFireDataModifier
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
export class TransformModifier implements IFireDataModifier {
  private readonly trans: TConstantOrLazy<mat.Matrix>;
  public constructor(trans: TConstantOrLazy<mat.Matrix>) {
    this.trans = trans;
  }

  public modifyFireData(stateConst: IFiringState, fireData: IFireData): void {
    const transConst = calcTransFormFromConstantOrLazy(stateConst, this.trans);
    fireData.transform = mat.transform(transConst, fireData.transform);
  }
}

export interface TInvertTransformOption {
  angle?: true;
  translationX?: true;
  translationY?: true;
}

/**
 * Invert transform matrix.
 */
export class InvertTransformModifier implements IFireDataModifier {
  private readonly option: TInvertTransformOption;
  public constructor(option: TInvertTransformOption) {
    this.option = option;
  }

  public modifyFireData(stateConst: IFiringState, fireData: IFireData): void {
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
export class SetParameterImmediatelyModifier implements IFireDataModifier {
  private readonly name: string;
  private readonly value: TConstantOrLazy<number>;

  public constructor(name: string, value: TConstantOrLazy<number>) {
    this.name = name;
    this.value = value;
  }

  public modifyFireData(stateConst: IFiringState, fireData: IFireData): void {
    fireData.parameters.set(
      this.name,
      calcValueFromConstantOrLazy(stateConst, this.value)
    );
  }
}

/**
 * Modify parameter with given function later.
 */
export class ModifyParameterModifier implements IFireDataModifier {
  private readonly name: string;
  private readonly modifier: (
    stateConst: IFiringState,
    oldValue: number
  ) => number;

  public constructor(
    name: string,
    modifier: (stateConst: IFiringState, oldValue: number) => number
  ) {
    this.name = name;
    this.modifier = modifier;
  }

  public modifyFireData(stateConst: IFiringState, fireData: IFireData): void {
    const oldValue = fireData.parameters.get(this.name);
    if (oldValue === undefined)
      throw new Error(`parameter <${this.name}> was not set`);
    fireData.parameters.set(this.name, this.modifier(stateConst, oldValue));
  }
}

/**
 * Set text in FireData when played.
 */
export class SetTextImmediatelyModifier implements IFireDataModifier {
  private readonly name: string;
  private readonly text: TConstantOrLazy<string>;

  public constructor(name: string, text: TConstantOrLazy<string>) {
    this.name = name;
    this.text = text;
  }

  public modifyFireData(stateConst: IFiringState, fireData: IFireData): void {
    fireData.texts.set(
      this.name,
      calcValueFromConstantOrLazy(stateConst, this.text)
    );
  }
}

/**
 * Set muzzle in FireData when played.
 */
export class SetMuzzleImmediatelyModifier implements IFireDataModifier {
  private readonly name: TConstantOrLazy<string>;

  public constructor(name: TConstantOrLazy<string>) {
    this.name = name;
  }

  public modifyFireData(stateConst: IFiringState, _fireData: IFireData): void {
    const muzzleName = calcValueFromConstantOrLazy(stateConst, this.name);
    stateConst.muzzle = stateConst.getMuzzleByName(muzzleName);
  }
}

/**
 * Attach virtual muzzle to current muzzle.
 */
export class AttachVirtualMuzzleImmediatelyModifier
  implements IFireDataModifier {
  private readonly virtualMuzzleGenerator: IVirtualMuzzleGenerator;

  public constructor(virtualMuzzleGenerator: IVirtualMuzzleGenerator) {
    this.virtualMuzzleGenerator = virtualMuzzleGenerator;
  }

  public modifyFireData(stateConst: IFiringState, _fireData: IFireData): void {
    if (stateConst.muzzle === null)
      throw new Error("Muzzle was not set at FiringState");
    const muzzle = this.virtualMuzzleGenerator.generate();
    muzzle.basedOn(stateConst.muzzle);
    stateConst.muzzle = muzzle;
  }
}
