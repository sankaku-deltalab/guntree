import { IFiringState } from 'guntree/gun';
import { ILazyEvaluative } from 'guntree/lazyEvaluative';
import { Wait } from 'guntree/elements/gun';

describe('#Wait', () => {
    test('consume constant input frames', () => {
        // Given firing state
        const firingStateClass = jest.fn<IFiringState>(() => ({}));
        const state = new firingStateClass();

        // And Wait
        const waitFrames = 3;
        const wait = new Wait(waitFrames);

        // When play Concat
        const progress = wait.play(state);
        let consumedFrames = 0;
        while (true) {
            const r = progress.next();
            if (r.done) break;
            consumedFrames += 1;
        }

        // And finish Wait with input frames
        expect(consumedFrames).toBe(waitFrames);
    });

    test('consume lazyEvaluative input frames', () => {
        // Given firing state
        const firingStateClass = jest.fn<IFiringState>(() => ({}));
        const state = new firingStateClass();

        // And lazyEvaluative
        const waitFrames = 3;
        const leClass = jest.fn<ILazyEvaluative<number>>(() => ({
            calc: jest.fn().mockReturnValueOnce(waitFrames),
        }));
        const le = new leClass();

        // And Wait
        const wait = new Wait(le);

        // When play Concat
        const progress = wait.play(state);
        let consumedFrames = 0;
        while (true) {
            const r = progress.next();
            if (r.done) break;
            consumedFrames += 1;
        }

        // And finish Wait with input frames
        expect(consumedFrames).toBe(waitFrames);
    });
});
