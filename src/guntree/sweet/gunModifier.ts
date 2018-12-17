import { TVector2D } from 'guntree/gun';
import { TConstantOrLazy } from 'guntree/lazyEvaluative';
import * as modO from 'guntree/contents/gunModifier';
import * as le from 'guntree/sweet/lazyEvaluative';

export const addParameter  = (name: string, adding: TConstantOrLazy<number>) => {
    return new modO.AddParameter(name, adding);
};

export const mltParameter  = (name: string, multiplier: TConstantOrLazy<number>) => {
    return new modO.MultiplyParameter(name, multiplier);
};

export const mltLaterAddingParameter  = (name: string, multiplier: TConstantOrLazy<number>) => {
    return new modO.MultiplyLaterAddingParameter(name, multiplier);
};

export const resetParameter  = (name: string, newValue: TConstantOrLazy<number>) => {
    return new modO.ResetParameter(name, newValue);
};

export const addAngle = (adding: TConstantOrLazy<number>) => addParameter('angle', adding);
export const addSpeed = (adding: TConstantOrLazy<number>) => addParameter('speed', adding);
export const addSize = (adding: TConstantOrLazy<number>) => addParameter('size', adding);
export const addNWayAngle = (option: le.TAddNWayAngleOption) => addAngle(le.nWayAngle(option));

export const mltAngle = (multiplier: TConstantOrLazy<number>) => mltParameter('angle', multiplier);
export const mltSpeed = (multiplier: TConstantOrLazy<number>) => mltParameter('speed', multiplier);
export const mltSize = (multiplier: TConstantOrLazy<number>) => mltParameter('size', multiplier);

export const mltLaterAngle = (multiplier: TConstantOrLazy<number>) => mltLaterAddingParameter('angle', multiplier);
export const mltLaterSpeed = (multiplier: TConstantOrLazy<number>) => mltLaterAddingParameter('speed', multiplier);
export const mltLaterSize = (multiplier: TConstantOrLazy<number>) => mltLaterAddingParameter('size', multiplier);

export const resetAngle = (newValue: TConstantOrLazy<number>) => resetParameter('angle', newValue);
export const resetSpeed = (newValue: TConstantOrLazy<number>) => resetParameter('speed', newValue);
export const resetSize = (newValue: TConstantOrLazy<number>) => resetParameter('size', newValue);

export const setText  = (key: string, text: TConstantOrLazy<string>) => {
    return new modO.SetText(key, text);
};

export const setMuzzle = (muzzle: string) => setText('muzzle', muzzle);

export const setVector  = (key: string, vector: TConstantOrLazy<TVector2D>) => {
    return new modO.SetVector(key, vector);
};

export const addVector  = (key: string, vector: TConstantOrLazy<TVector2D>) => {
    return new modO.AddVector(key, vector);
};
