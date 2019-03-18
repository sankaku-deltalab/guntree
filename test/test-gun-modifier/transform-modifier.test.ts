import * as mat from 'transformation-matrix';

import { IFiringState, IFireData } from 'guntree/firing-state';
import { TransformModifier } from 'guntree/elements/gunModifier';
import { simpleMock, leOnce } from '../util';

const fireDataClass = jest.fn<IFireData>((trans: mat.Matrix) => ({
    transform: trans,
}));

describe('#TransformModifier', () => {
    test('generate modifier transform fireData', () => {
        // Given FiringState
        const state = simpleMock<IFiringState>();

        // And FireData
        const initialTrans = mat.translate(1.125);
        const fd = new fireDataClass(initialTrans);

        // And Transform
        const trans = mat.translate(5);
        const transformMod = new TransformModifier(trans);

        // When modify FireData
        transformMod.modifyFireData(state, fd);

        // Then transform in fireData was transformed
        const expectedTrans = mat.transform(initialTrans, trans);
        expect(fd.transform).toEqual(expectedTrans);
    });

    test('can use lazyEvaluative transform', () => {
        // Given FiringState
        const state = simpleMock<IFiringState>();

        // And FireData
        const initialTrans = mat.translate(1.125);
        const fd = new fireDataClass(initialTrans);

        // And Transform
        const transConst = mat.translate(5);
        const transLe = leOnce(transConst);
        const transformMod = new TransformModifier(transLe);

        // When modify FireData
        transformMod.modifyFireData(state, fd);

        // Then transform in fireData was transformed
        const expectedTrans = mat.transform(initialTrans, transConst);
        expect(fd.transform).toEqual(expectedTrans);
    });
});
