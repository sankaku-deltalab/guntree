import { range } from 'lodash';
import * as mat from 'transformation-matrix';

import { IFiringState, IFireData } from 'guntree/firing-state';
import { Alternate } from 'guntree/elements/gun';
import { IGun } from 'guntree/gun';
import { InvertTransformModifier } from 'guntree/elements';
import { IMuzzle } from 'guntree/muzzle';
import { decomposeTransform } from 'guntree/transform-util';
import { simpleMock } from '../util';

const gunClass = jest.fn<IGun>((frame: number) => ({
    play: jest.fn().mockImplementation(() => {
        function* playing(): IterableIterator<void> {
            for (const _ of range(frame)) yield;
        }
        return playing();
    }),
}));

const stateClass = jest.fn<IFiringState>((clone1?: IFiringState, clone2?: IFiringState) => ({
    pushModifier: jest.fn(),
    copy: jest.fn().mockReturnValueOnce(clone1).mockReturnValueOnce(clone2),
}));

describe('#Alternate', () => {
    test('play child gun and inverted child gun as sequential', () => {
        // Given FiringState
        const stateClone1 = new stateClass();
        const stateClone2 = new stateClass();
        const state = new stateClass(stateClone1, stateClone2);

        // And Alternate with child gun
        const childGun = new gunClass(0);
        const alternate = new Alternate({}, childGun);

        // When play Alternate
        const progress = alternate.play(state);
        while (true) {
            const r = progress.next();
            if (r.done) break;
        }

        // Then child gun played twice
        expect(childGun.play).toBeCalledWith(stateClone1);
        expect(childGun.play).toBeCalledWith(stateClone2);

        // And second playing state was pushed InvertModifier
        expect(stateClone2.pushModifier).toBeCalled();
        const pushModifier = <jest.Mock>(stateClone2.pushModifier);
        const pushedMod = pushModifier.mock.calls[0][0];
        expect(pushedMod).toBeInstanceOf(InvertTransformModifier);
    });

    test('can specify another muzzle for inverted firing', () => {
        // Given FiringState
        const muzzle = simpleMock<IMuzzle>();
        const stateClone1 = new stateClass();
        const stateClone2 = new stateClass();
        const state = new stateClass(stateClone1, stateClone2);
        const getMuzzleByName = jest.fn().mockReturnValueOnce(muzzle);
        state.getMuzzleByName = getMuzzleByName;
        stateClone1.getMuzzleByName = getMuzzleByName;
        stateClone2.getMuzzleByName = getMuzzleByName;

        // And Alternate with child gun
        const muzzleName = 'a';
        const childGun = new gunClass(0);
        const alternate = new Alternate({ invertedMuzzleName: muzzleName }, childGun);

        // When play Alternate
        const progress = alternate.play(state);
        while (true) {
            const r = progress.next();
            if (r.done) break;
        }

        // Then child gun played twice
        expect(childGun.play).toBeCalledWith(stateClone1);
        expect(childGun.play).toBeCalledWith(stateClone2);

        // And second playing state was set muzzle
        expect(stateClone2.muzzle).toBe(muzzle);
        expect(state.getMuzzleByName).toBeCalledWith(muzzleName);
    });

    test('consume frames equal to double of child frames', () => {
        // Given FiringState
        const stateClone1 = new stateClass();
        const stateClone2 = new stateClass();
        const state = new stateClass(stateClone1, stateClone2);

        // And Alternate with child gun
        const childFrames = 6;
        const childGun = new gunClass(childFrames);
        const alternate = new Alternate({}, childGun);

        // When play Alternate
        let consumedFrames = 0;
        const progress = alternate.play(state);
        while (true) {
            const r = progress.next();
            if (r.done) break;
            consumedFrames += 1;
        }

        // Then consume frames equal to double of child frames
        expect(consumedFrames).toBe(childFrames * 2);
    });

    test('inverted firing inverted angle', () => {
        // Given FiringState
        const stateClone1 = new stateClass();
        const stateClone2 = new stateClass();
        const state = new stateClass(stateClone1, stateClone2);

        // And FireData
        const angle = 13;
        const fd = simpleMock<IFireData>();
        fd.transform = mat.rotateDEG(angle);

        // And Alternate with child gun
        const childGun = new gunClass(0);
        const alternate = new Alternate({}, childGun);

        // When play Alternate
        const progress = alternate.play(state);
        while (true) {
            const r = progress.next();
            if (r.done) break;
        }

        // Then child gun played twice
        expect(childGun.play).toBeCalledWith(stateClone1);
        expect(childGun.play).toBeCalledWith(stateClone2);

        // And second transform was inverted angle
        const pushModifier = <jest.Mock>(stateClone2.pushModifier);
        const pushedMod = <InvertTransformModifier>(pushModifier.mock.calls[0][0]);
        pushedMod.modifyFireData(new stateClass(), fd);
        const [_, mirroredAngle, __] = decomposeTransform(fd.transform);
        expect(mirroredAngle).toBeCloseTo(-angle);
    });

    test('can invert translation x', () => {
        // Given FiringState
        const stateClone1 = new stateClass();
        const stateClone2 = new stateClass();
        const state = new stateClass(stateClone1, stateClone2);

        // And FireData
        const translationX = 13;
        const fd = simpleMock<IFireData>();
        fd.transform = mat.translate(translationX, 0);

        // And Alternate with child gun and specify invert translation x
        const childGun = new gunClass(0);
        const alternate = new Alternate({ mirrorTranslationX: true }, childGun);

        // When play Alternate
        const progress = alternate.play(state);
        while (true) {
            const r = progress.next();
            if (r.done) break;
        }

        // Then child gun played twice
        expect(childGun.play).toBeCalledWith(stateClone1);
        expect(childGun.play).toBeCalledWith(stateClone2);

        // And second transform was inverted translation x
        const pushModifier = <jest.Mock>(stateClone2.pushModifier);
        const pushedMod = <InvertTransformModifier>(pushModifier.mock.calls[0][0]);
        pushedMod.modifyFireData(new stateClass(), fd);
        const [mirroredTrans, _, __] = decomposeTransform(fd.transform);
        expect(mirroredTrans.x).toBeCloseTo(-translationX);
    });

    test('can invert translation y', () => {
        // Given FiringState
        const stateClone1 = new stateClass();
        const stateClone2 = new stateClass();
        const state = new stateClass(stateClone1, stateClone2);

        // And FireData
        const translationY = 13;
        const fd = simpleMock<IFireData>();
        fd.transform = mat.translate(0, translationY);

        // And Alternate with child gun and specify invert translation y
        const childGun = new gunClass(0);
        const alternate = new Alternate({ mirrorTranslationY: true }, childGun);

        // When play Alternate
        const progress = alternate.play(state);
        while (true) {
            const r = progress.next();
            if (r.done) break;
        }

        // Then child gun played twice
        expect(childGun.play).toBeCalledWith(stateClone1);
        expect(childGun.play).toBeCalledWith(stateClone2);

        // And second transform was inverted translation x
        const pushModifier = <jest.Mock>(stateClone2.pushModifier);
        const pushedMod = <InvertTransformModifier>(pushModifier.mock.calls[0][0]);
        pushedMod.modifyFireData(new stateClass(), fd);
        const [mirroredTrans, _, __] = decomposeTransform(fd.transform);
        expect(mirroredTrans.y).toBeCloseTo(-translationY);
    });
});
