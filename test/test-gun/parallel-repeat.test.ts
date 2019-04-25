import { range } from 'lodash';

import { IFiringState, IRepeatState, IRepeatStateManager } from 'guntree/firing-state';
import { ParallelRepeat } from 'guntree/elements/gun';
import {
    simpleMock,
    createLazyEvaluativeMockReturnOnce,
    createGunMockConsumeFrames,
    createFiringStateMock,
} from 'test/util';

const createRepeatStateManager = (clone?: IRepeatStateManager) => {
    const rsm = simpleMock<IRepeatStateManager>();
    rsm.copy = jest.fn().mockReturnValue(clone);
    rsm.start = jest.fn().mockImplementation((rs: IRepeatState) => rs);
    rsm.finish = jest.fn();
    return rsm;
};

const createFiringState = (rsm: IRepeatStateManager, clone?: IFiringState) => {
    const clones = [];
    if (clone !== undefined) {
        clones.push(clone);
    }
    const state = createFiringStateMock(...clones);
    state.repeatStates = rsm;
    return state;
};

const createFiringStateAndRSM = (
    fsClone?: IFiringState, rsmClone?: IRepeatStateManager): [IFiringState, IRepeatStateManager] => {
    const rsm = createRepeatStateManager(rsmClone);
    const fs = createFiringState(rsm, fsClone);
    return [fs, rsm];
};

describe('#ParallelRepeat', () => {
    test.each`
    frames | times | interval
    ${0}   | ${0}  | ${0}
    ${0}   | ${1}  | ${0}
    ${0}   | ${0}  | ${1}
    ${1}   | ${1}  | ${1}
    ${5}   | ${5}  | ${1}
    ${6}   | ${1}  | ${6}
    ${14}  | ${2}  | ${7}
    `('consume $frames frames when (times: $times, interval: $interval) if no child', ({ frames, times, interval }) => {
        // Given repeating progress
        const [fsClone, rsmClone] = createFiringStateAndRSM();
        const [state, rsm] = createFiringStateAndRSM(fsClone, rsmClone);

        // When play ParallelRepeat
        const repeat = new ParallelRepeat({ times, interval }, createGunMockConsumeFrames(0));
        const progress = repeat.play(state);
        let consumedFrames = 0;
        while (true) {
            const r = progress.next();
            if (r.done) break;
            consumedFrames += 1;
        }

        // Then consume frames
        expect(consumedFrames).toBe(frames);
    });

    test.each`
    frames | times | interval | childFrames
    ${0}   | ${0}  | ${0}     | ${0}
    ${0}   | ${1}  | ${0}     | ${0}
    ${0}   | ${0}  | ${1}     | ${0}
    ${0}   | ${0}  | ${0}     | ${1}
    ${1}   | ${1}  | ${1}     | ${0}
    ${1}   | ${1}  | ${0}     | ${1}
    ${2}   | ${1}  | ${1}     | ${1}
    ${5}   | ${5}  | ${1}     | ${0}
    ${6}   | ${1}  | ${6}     | ${0}
    ${7}   | ${1}  | ${3}     | ${4}
    ${17}  | ${2}  | ${7}     | ${3}
    `('consume $frames frames given by (times * interval + (times !== 0) * childFrames)', (
        { frames, times, interval, childFrames }) => {
        // Given repeating progress
        const [fsClone, rsmClone] = createFiringStateAndRSM();
        const [state, rsm] = createFiringStateAndRSM(fsClone, rsmClone);

        // And gun consume childFrames
        const gun = createGunMockConsumeFrames(childFrames);

        // When play ParallelRepeat
        const repeat = new ParallelRepeat({ times, interval }, gun);
        const progress = repeat.play(state);
        let consumedFrames = 0;
        while (true) {
            const r = progress.next();
            if (r.done) break;
            consumedFrames += 1;
        }

        // Then consume frames
        expect(consumedFrames).toBe(frames);
    });

    test('use lazyEvaluative to times', () => {
        // Given repeating progress
        const [fsClone, rsmClone] = createFiringStateAndRSM();
        const [state, rsm] = createFiringStateAndRSM(fsClone, rsmClone);

        // And lazyEvaluative used for times
        const expectedTimes = 5;
        const le = createLazyEvaluativeMockReturnOnce<number>(expectedTimes);

        // When play ParallelRepeat
        const interval = 3;
        const repeat = new ParallelRepeat({ interval, times: le }, createGunMockConsumeFrames(0));
        const progress = repeat.play(state);
        let consumedFrames = 0;
        while (true) {
            const r = progress.next();
            if (r.done) break;

            // Then lazyEvaluative was evaluated at only first frame
            if (consumedFrames === 0) {
                expect(le.calc).toBeCalledTimes(1);
                expect(le.calc).lastCalledWith(state);
                expect(le.calc).toReturnWith(expectedTimes);
            }

            consumedFrames += 1;
        }

        // Then consume frames
        expect(consumedFrames).toBe(expectedTimes * interval);

        // And lazyEvaluative was evaluated only once time
        expect(le.calc).toBeCalledTimes(1);
    });

    test('use lazyEvaluative to interval', () => {
        // Given repeating progress
        const [fsClone, rsmClone] = createFiringStateAndRSM();
        const [state, rsm] = createFiringStateAndRSM(fsClone, rsmClone);

        // And lazyEvaluative used for interval
        const expectedInterval = 5;
        const le = createLazyEvaluativeMockReturnOnce<number>(expectedInterval);

        // When play ParallelRepeat
        const times = 3;
        const repeat = new ParallelRepeat({ times, interval: le }, createGunMockConsumeFrames(0));
        const progress = repeat.play(state);
        while (true) {
            const r = progress.next();
            if (r.done) break;
        }

        // Then interval evaluated at each repeating
        expect(le.calc).toBeCalledTimes(times);
    });

    test('play gun at first frame of each repeating', () => {
        // Given repeating progress
        const [fsClone, rsmClone] = createFiringStateAndRSM();
        const [state, rsm] = createFiringStateAndRSM(fsClone, rsmClone);

        // And guns consume childFrames
        const childFrames = 3;
        const gun = createGunMockConsumeFrames(childFrames);

        // When play ParallelRepeat
        const times = 4;
        const interval = 6;
        const expectedFrames = times * (childFrames + interval);
        const gunStartFrames = range(expectedFrames).map(f => f % interval === 0);

        const repeat = new ParallelRepeat({ times, interval }, gun);
        const progress = repeat.play(state);

        let consumedFrames = 0;
        let expectedFiredCount = 0;
        while (true) {
            const r = progress.next();

            // Then play guns at expected frames
            if (gunStartFrames[consumedFrames]) {
                expectedFiredCount = Math.min(expectedFiredCount + 1, times);
                expect(gun.play).lastCalledWith(fsClone);
            }
            expect(gun.play).toBeCalledTimes(expectedFiredCount);

            consumedFrames += 1;
            if (r.done) break;
        }
    });
});
