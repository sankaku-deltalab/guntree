import { range } from 'lodash';

import { IGun } from 'guntree/gun';
import { IFiringState } from 'guntree/firing-state';
import { Parallel } from 'guntree/elements/gun';

const createFiringStateMocks = (cloneNum: number): [IFiringState, IFiringState[]] => {
    const firingStateClass = jest.fn<IFiringState>(() => ({
        copy: jest.fn(),
    }));
    const clones = range(cloneNum).map(_ => new firingStateClass());
    const state = new firingStateClass();
    for (const clone of clones) {
        (<jest.Mock> state.copy).mockReturnValueOnce(clone);
    }
    return [state, clones];
};

const mockGunClass = jest.fn<IGun>((frame: number) => ({
    play: jest.fn().mockImplementation(() => {
        function* playing(): IterableIterator<void> {
            for (const _ of range(frame)) yield;
        }
        return playing();
    }),
}));

describe('#Parallel', () => {
    test('play multiple guns as parallel and each guns are played with cloned state', () => {
        // Given firing state
        const gunNum = 3;
        const [state, clones] = createFiringStateMocks(gunNum);

        // And guns
        const childFrames = 5;
        const guns = range(gunNum).map(_ => new mockGunClass(childFrames));

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
