import * as mat from 'transformation-matrix';

import { TConstantOrLazy, calcValueFromConstantOrLazy } from '../lazyEvaluative';
import * as modO from '../elements/gunModifier';
import * as le from '../contents/lazyEvaluative';
import { IVirtualMuzzleGenerator } from 'guntree/muzzle';
import { IFiringState } from 'guntree/firing-state';

/**
 * Transform matrix.
 */
export const transform = (trans: TConstantOrLazy<mat.Matrix>): modO.ModifierGun => {
    return new modO.ModifierGun(true, new modO.TransformModifier(trans));
};

/**
 * Set parameter in FireData when played.
 */
export const setParameterImmediately = (
        name: string,
        value: TConstantOrLazy<number>) => {
    return new modO.ModifierGun(false, new modO.SetParameterImmediatelyModifier(name, value));
};

/**
 * Set parameter in FireData when played.
 */
export const modifyParameter = (
        name: string,
        modifier: (stateConst: IFiringState, oldValue: number) => number) => {
    return new modO.ModifierGun(true, new modO.ModifyParameterModifier(name, modifier));
};

/**
 * Set muzzle in FireData when played.
 */
export const setMuzzleImmediately = (
        name: TConstantOrLazy<string>) => {
    return new modO.ModifierGun(false, new modO.SetMuzzleImmediatelyModifier(name));
};

/**
 * Attach virtual muzzle to current muzzle.
 */
export const attachVirtualMuzzleImmediately = (
        virtualMuzzleGenerator: IVirtualMuzzleGenerator) => {
    return new modO.ModifierGun(false, new modO.AttachVirtualMuzzleImmediatelyModifier(virtualMuzzleGenerator));
};

/**
 * Set text in FireData when played.
 */
export const setTextImmediately = (
        name: string,
        text: TConstantOrLazy<string>) => {
    return new modO.ModifierGun(false, new modO.SetTextImmediatelyModifier(name, text));
};

export const addAngle = (angleDeg: TConstantOrLazy<number>) => {
    return transform(le.createTransform({ rotationDeg: angleDeg }));
};

export const addParameter  = (name: string, adding: TConstantOrLazy<number>) => {
    return modifyParameter(name, (stateConst, oldValue) => {
        return oldValue + calcValueFromConstantOrLazy<number>(stateConst, adding);
    });
};

export const mltParameter  = (name: string, adding: TConstantOrLazy<number>) => {
    return modifyParameter(name, (stateConst, oldValue) => {
        return oldValue * calcValueFromConstantOrLazy<number>(stateConst, adding);
    });
};

export const resetParameter  = (name: string, newValue: TConstantOrLazy<number>) => {
    return modifyParameter(name, (stateConst, oldValue) => {
        return calcValueFromConstantOrLazy<number>(stateConst, newValue);
    });
};

export const addSpeed = (adding: TConstantOrLazy<number>) => addParameter('speed', adding);
export const addSize = (adding: TConstantOrLazy<number>) => addParameter('size', adding);
export const addNWayAngle = (option: le.TAddNWayAngleOption) => addAngle(le.nWayAngle(option));

export const mltSpeed = (multiplier: TConstantOrLazy<number>) => mltParameter('speed', multiplier);
export const mltSize = (multiplier: TConstantOrLazy<number>) => mltParameter('size', multiplier);

export const resetSpeed = (newValue: TConstantOrLazy<number>) => resetParameter('speed', newValue);
export const resetSize = (newValue: TConstantOrLazy<number>) => resetParameter('size', newValue);
