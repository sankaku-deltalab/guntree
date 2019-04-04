import * as mat from 'transformation-matrix';

import { IFiringState, IFireData } from 'guntree/firing-state';
import { InvertTransformModifier } from 'guntree/elements/gunModifier';
import { IMuzzle, IVirtualMuzzle, IVirtualMuzzleGenerator } from 'guntree/muzzle';
import { simpleMock } from '../util';
import { decomposeTransform } from 'guntree/transform-util';

const fireDataClass = jest.fn<IFireData>((trans: mat.Matrix) => ({
    transform: trans,
}));

describe('#InvertTransformModifier', () => {
    test('can invert angle', () => {
        // Given FiringState
        const state = simpleMock<IFiringState>();

        // And FireData with transform
        const initialAngle = 13;
        const fd = new fireDataClass(mat.rotateDEG(initialAngle));

        // And InvertTransformModifier with angle inverting option
        const invertMod = new InvertTransformModifier({ angle: true });

        // When modify InvertTransformModifier
        invertMod.modifyFireData(state, fd);

        // Then modified transform was inverted angle
        const [_, modifiedAngle, __] = decomposeTransform(fd.transform);
        expect(modifiedAngle).toBeCloseTo(-initialAngle);
    });

    test('can invert translation x', () => {
        // Given FiringState
        const state = simpleMock<IFiringState>();

        // And FireData with transform
        const initialTransX = 13;
        const fd = new fireDataClass(mat.translate(initialTransX, 0));
        const oldTrans = fd.transform;

        // And InvertTransformModifier with translation x inverting option
        const invertMod = new InvertTransformModifier({ translationX: true });

        // When modify InvertTransformModifier
        invertMod.modifyFireData(state, fd);

        // Then modified transform was inverted angle
        expect(fd.transform).not.toBe(oldTrans);
        const [modifiedTrans, _, __] = decomposeTransform(fd.transform);
        expect(modifiedTrans.x).toBeCloseTo(-initialTransX);
    });

    test('can invert translation y', () => {
        // Given FiringState
        const state = simpleMock<IFiringState>();

        // And FireData with transform
        const initialTransY = 13;
        const fd = new fireDataClass(mat.translate(0, initialTransY));
        const oldTrans = fd.transform;

        // And InvertTransformModifier with translation y inverting option
        const invertMod = new InvertTransformModifier({ translationY: true });

        // When modify InvertTransformModifier
        invertMod.modifyFireData(state, fd);

        // Then modified transform was inverted angle
        expect(fd.transform).not.toBe(oldTrans);
        const [modifiedTrans, _, __] = decomposeTransform(fd.transform);
        expect(modifiedTrans.y).toBeCloseTo(-initialTransY);
    });
});
