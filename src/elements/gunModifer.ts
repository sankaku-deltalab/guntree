import * as mat from 'transformation-matrix';

import { IGun } from '../gun';
import { IFiringState, TFireDataModifier, IFireData } from '../firing-state';
import { TConstantOrLazy, calcValueFromConstantOrLazy, calcTransFormFromConstantOrLazy } from '../lazyEvaluative';

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
