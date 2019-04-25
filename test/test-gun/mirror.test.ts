import * as mat from 'transformation-matrix';

import { IFireData } from 'guntree/firing-state';
import { Mirror } from 'guntree/elements/gun';
import { InvertTransformModifier } from 'guntree/elements';
import { IMuzzle } from 'guntree/muzzle';
import { decomposeTransform } from 'guntree/transform-util';
import { simpleMock, createGunMockConsumeFrames, createFiringStateMock } from '../util';

describe('#Mirror', () => {
    test('play child gun and inverted child gun as parallel', () => {
        // Given FiringState
        const stateClone1 = createFiringStateMock();
        const stateClone2 = createFiringStateMock();
        const state = createFiringStateMock(stateClone1, stateClone2);

        // And Mirror with child gun
        const childGun = createGunMockConsumeFrames(0);
        const mirror = new Mirror({}, childGun);

        // When play Mirror
        const progress = mirror.play(state);
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
        const stateClone1 = createFiringStateMock();
        const stateClone2 = createFiringStateMock();
        const state = createFiringStateMock(stateClone1, stateClone2);
        const getMuzzleByName = jest.fn().mockReturnValueOnce(muzzle);
        state.getMuzzleByName = getMuzzleByName;
        stateClone1.getMuzzleByName = getMuzzleByName;
        stateClone2.getMuzzleByName = getMuzzleByName;

        // And Mirror with child gun
        const muzzleName = 'a';
        const childGun = createGunMockConsumeFrames(0);
        const mirror = new Mirror({ invertedMuzzleName: muzzleName }, childGun);

        // When play Mirror
        const progress = mirror.play(state);
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

    test('consume frames equal to child frames', () => {
        // Given FiringState
        const stateClone1 = createFiringStateMock();
        const stateClone2 = createFiringStateMock();
        const state = createFiringStateMock(stateClone1, stateClone2);

        // And Mirror with child gun
        const childFrames = 6;
        const childGun = createGunMockConsumeFrames(childFrames);
        const mirror = new Mirror({}, childGun);

        // When play Mirror
        let consumedFrames = 0;
        const progress = mirror.play(state);
        while (true) {
            const r = progress.next();
            if (r.done) break;
            consumedFrames += 1;
        }

        // Then consume frames equal to child frames
        expect(consumedFrames).toBe(childFrames);
    });

    test('inverted firing inverted angle', () => {
        // Given FiringState
        const stateClone1 = createFiringStateMock();
        const stateClone2 = createFiringStateMock();
        const state = createFiringStateMock(stateClone1, stateClone2);

        // And FireData
        const angle = 13;
        const fd = simpleMock<IFireData>();
        fd.transform = mat.rotateDEG(angle);

        // And Mirror with child gun
        const childGun = createGunMockConsumeFrames(0);
        const mirror = new Mirror({}, childGun);

        // When play Mirror
        const progress = mirror.play(state);
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
        pushedMod.modifyFireData(createFiringStateMock(), fd);
        const [_, mirroredAngle, __] = decomposeTransform(fd.transform);
        expect(mirroredAngle).toBeCloseTo(-angle);
    });

    test('can invert translation x', () => {
        // Given FiringState
        const stateClone1 = createFiringStateMock();
        const stateClone2 = createFiringStateMock();
        const state = createFiringStateMock(stateClone1, stateClone2);

        // And FireData
        const translationX = 13;
        const fd = simpleMock<IFireData>();
        fd.transform = mat.translate(translationX, 0);

        // And Mirror with child gun and specify invert translation x
        const childGun = createGunMockConsumeFrames(0);
        const mirror = new Mirror({ mirrorTranslationX: true }, childGun);

        // When play Mirror
        const progress = mirror.play(state);
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
        pushedMod.modifyFireData(createFiringStateMock(), fd);
        const [mirroredTrans, _, __] = decomposeTransform(fd.transform);
        expect(mirroredTrans.x).toBeCloseTo(-translationX);
    });

    test('can invert translation y', () => {
        // Given FiringState
        const stateClone1 = createFiringStateMock();
        const stateClone2 = createFiringStateMock();
        const state = createFiringStateMock(stateClone1, stateClone2);

        // And FireData
        const translationY = 13;
        const fd = simpleMock<IFireData>();
        fd.transform = mat.translate(0, translationY);

        // And Mirror with child gun and specify invert translation y
        const childGun = createGunMockConsumeFrames(0);
        const mirror = new Mirror({ mirrorTranslationY: true }, childGun);

        // When play Mirror
        const progress = mirror.play(state);
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
        pushedMod.modifyFireData(createFiringStateMock(), fd);
        const [mirroredTrans, _, __] = decomposeTransform(fd.transform);
        expect(mirroredTrans.y).toBeCloseTo(-translationY);
    });
});
