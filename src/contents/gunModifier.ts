import { TConstantOrLazy, calcValueFromConstantOrLazy } from '../lazyEvaluative';
import * as modO from '../elements/gunModifier';
import * as le from '../contents/lazyEvaluative';

export const addAngle = (angleDeg: TConstantOrLazy<number>) => {
    return new modO.Transform(le.createTransform({ rotationDeg: angleDeg }));
};

export const addParameter  = (name: string, adding: TConstantOrLazy<number>) => {
    return new modO.ModifyParameter(name, (stateConst, oldValue) => {
        return oldValue + calcValueFromConstantOrLazy<number>(stateConst, adding);
    });
};

export const mltParameter  = (name: string, adding: TConstantOrLazy<number>) => {
    return new modO.ModifyParameter(name, (stateConst, oldValue) => {
        return oldValue * calcValueFromConstantOrLazy<number>(stateConst, adding);
    });
};

export const resetParameter  = (name: string, newValue: TConstantOrLazy<number>) => {
    return new modO.ModifyParameter(name, (stateConst, oldValue) => {
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
