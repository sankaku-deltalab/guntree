import { range } from 'lodash';

import { IGun } from 'guntree/gun';
import { IFiringState } from 'guntree/firing-state';
import { Concat } from 'guntree/elements/gun';

const mockGunClass = jest.fn<IGun>((frame: number) => ({
    play: jest.fn().mockImplementation(() => {
        function* playing(): IterableIterator<void> {
            for (const _ of range(frame)) yield;
        }
        return playing();
    }),
}));

describe('#Concat', () => {
    test('play multiple guns as sequentially with state without copy', () => {
        // Given firing state
        const firingStateClass = jest.fn<IFiringState>(() => ({
            copy: jest.fn(),
        }));
        const state = new firingStateClass();

        // And guns
        const gunNum = 2;
        const childFrames = 3;
        const guns = range(gunNum).map(_ => new mockGunClass(childFrames));

        // And Concat
        const concat = new Concat(...guns);

        // When play Concat
        const progress = concat.play(state);
        let consumedFrames = 0;
        while (true) {
            const r = progress.next();
            if (r.done) break;

            // Then play child guns as sequentially with state without copy
            const idx = Math.floor(consumedFrames / childFrames);
            expect(guns[idx].play).toBeCalledTimes(1);
            expect(guns[idx].play).toBeCalledWith(state);

            for (const gun of guns.slice(idx + 1)) {
                expect(gun.play).toBeCalledTimes(0);
            }

            consumedFrames += 1;
        }

        // And finish Concat with childFrames * gunNum frames
        expect(consumedFrames).toBe(childFrames * gunNum);
    });
});
