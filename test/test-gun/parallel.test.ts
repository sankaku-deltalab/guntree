import { range } from 'lodash';

import { IGun } from 'guntree/gun';
import { IFiringState } from 'guntree/firing-state';
import { Parallel } from 'guntree/elements/gun';
import {
    createGunMockConsumeFrames,
    createFiringStateMock,
} from '../util';

describe('#Parallel', () => {
    test('play multiple guns as parallel and each guns are played with cloned state', () => {
        // Given firing state
        const gunNum = 3;
        const clones = range(gunNum).map(_ => createFiringStateMock());
        const state = createFiringStateMock(...clones);

        // And guns
        const childFrames = 5;
        const guns = range(gunNum).map(_ => createGunMockConsumeFrames(childFrames));

        // And Parallel
        const sec = new Parallel(...guns);

        // When play Concat
        const progress = sec.play(state);
        let consumedFrames = 0;
        while (true) {
            const r = progress.next();
            if (r.done) break;

            // Then play child guns as parallel with state without copy
            for (const idx of range(gunNum)) {
                expect(guns[idx].play).toBeCalledTimes(1);
                expect(guns[idx].play).toBeCalledWith(clones[idx]);
            }

            consumedFrames += 1;
        }

        // And finish Concat with childFrames frames
        expect(consumedFrames).toBe(childFrames);
    });
});
