import * as mat from 'transformation-matrix';

import { IGun } from '../gun';
import { IFiringState, TFireDataModifier, IFireData } from '../firing-state';
import { TConstantOrLazy, calcValueFromConstantOrLazy, calcTransFormFromConstantOrLazy } from '../lazyEvaluative';
import { IVirtualMuzzleGenerator } from 'guntree/muzzle';

const modifyImmediatelyOrLater = (state: IFiringState, modifyLater: boolean, modifier: TFireDataModifier): void => {
    if (modifyLater) {
        state.pushModifier(modifier);
    } else {
        modifier(state, state.fireData);
    }
};

export class Transform implements IGun {
    constructor(private readonly trans: TConstantOrLazy<mat.Matrix>) {}

    *play(state: IFiringState): IterableIterator<void> {
        const mod = (stateConst: IFiringState, fireData: IFireData) => {
            const trans = calcTransFormFromConstantOrLazy(stateConst, this.trans);
            fireData.transform = mat.transform(fireData.transform, trans);
        };
        modifyImmediatelyOrLater(state, true, mod);
    }
}

export class SetParameterImmediately implements IGun {
    constructor(private readonly name: string,
                private readonly value: TConstantOrLazy<number>) {}

    *play(state: IFiringState): IterableIterator<void> {
        const mod = (stateConst: IFiringState, fireData: IFireData) => {
            fireData.parameters.set(this.name, calcValueFromConstantOrLazy(stateConst, this.value));
        };
        modifyImmediatelyOrLater(state, false, mod);
    }
}

export class ModifyParameter implements IGun {
    constructor(private readonly name: string,
                private readonly modifier: (stateConst: IFiringState, oldValue: number) => number) {}

    *play(state: IFiringState): IterableIterator<void> {
        const mod = (stateConst: IFiringState, fireData: IFireData) => {
            const oldValue = fireData.parameters.get(this.name);
            if (oldValue === undefined) throw new Error(`parameter <${this.name}> was not set`);
            fireData.parameters.set(this.name, this.modifier(stateConst, oldValue));
        };
        modifyImmediatelyOrLater(state, true, mod);
    }
}

export class SetTextImmediately implements IGun {
    constructor(private readonly name: string,
                private readonly text: TConstantOrLazy<string>) {}

    *play(state: IFiringState): IterableIterator<void> {
        const text = calcValueFromConstantOrLazy(state, this.text);
        const mod = (stateConst: IFiringState, fireData: IFireData) => {
            fireData.texts.set(this.name, text);
        };
        modifyImmediatelyOrLater(state, false, mod);
    }
}

/**
 * Set muzzle.
 */
export class SetMuzzleImmediately implements IGun {
    constructor(private readonly name: TConstantOrLazy<string>) {}

    *play(state: IFiringState): IterableIterator<void> {
        const muzzleName = calcValueFromConstantOrLazy(state, this.name);
        state.muzzle = state.getMuzzleByName(muzzleName);
    }
}

/**
 * Attach virtual muzzle to current muzzle.
 */
export class AttachVirtualMuzzleImmediately implements IGun {
    constructor(private readonly virtualMuzzleGenerator: IVirtualMuzzleGenerator) {}

    *play(state: IFiringState): IterableIterator<void> {
        if (state.muzzle === null) throw new Error('Muzzle was not set at FiringState');
        const muzzle = this.virtualMuzzleGenerator.generate();
        muzzle.basedOn(state.muzzle);
        state.muzzle = muzzle;
    }
}