import { range } from 'lodash';

import { IFiringState, IGun } from 'guntree/gun';
import { Sequential } from 'guntree/contents/gun';

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

describe('#Sequential', () => {
    test('play multiple guns as sequentially and each guns are played with cloned state', () => {
        // Given firing state
        const gunNum = 3;
        const [state, clones] = createFiringStateMocks(gunNum);

        // And guns
        const childFrames = 5;
        const guns = range(gunNum).map(_ => new mockGunClass(childFrames));

        // And Sequential
        const sec = new Sequential(...guns);

        // When play Concat
        const progress = sec.play(state);
        let consumedFrames = 0;
        while (true) {
            const r = progress.next();
            if (r.done) break;

            // Then play child guns as sequentially with state without copy
            const idx = Math.floor(consumedFrames / childFrames);
            expect(guns[idx].play).toBeCalledTimes(1);
            expect(guns[idx].play).toBeCalledWith(clones[idx]);

            for (const gun of guns.slice(idx + 1)) {
                expect(gun.play).toBeCalledTimes(0);
            }

            consumedFrames += 1;
        }

        // And finish Concat with childFrames * gunNum frames
        expect(consumedFrames).toBe(childFrames * gunNum);
    });
});
