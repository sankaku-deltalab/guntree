import { range } from 'lodash';

import { IFiringState, IRepeatState, IRepeatStateManager } from 'guntree/firing-state';
import { Repeat } from 'guntree/elements/gun';
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

const createFiringStateAndRSM = (
    fsClone?: IFiringState, rsmClone?: IRepeatStateManager,
): [IFiringState, IRepeatStateManager] => {
    const rsm = createRepeatStateManager(rsmClone);
    const fsClones = [];
    if (fsClone !== undefined) {
        fsClones.push(fsClone);
    }
    const fs = createFiringStateMock(...fsClones);
    return [fs, rsm];
};

describe('#Repeat', () => {
    test.each`
    frames | times | interval
    ${0}   | ${0}  | ${0}
    ${0}   | ${1}  | ${0}
    ${0}   | ${0}  | ${1}
    ${1}   | ${1}  | ${1}
    ${5}   | ${5}  | ${1}
    ${6}   | ${1}  | ${6}
    ${14}  | ${2}  | ${7}
    `('consume $frames frames given by (times: $times * interval: $interval)', ({ frames, times, interval }) => {
        // Given repeating progress
        const [fsClone, rsmClone] = createFiringStateAndRSM();
        const [state, rsm] = createFiringStateAndRSM(fsClone, rsmClone);

        // When play Repeat
        const repeat = new Repeat({ times, interval }, createGunMockConsumeFrames(0));
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
    ${20}  | ${2}  | ${7}     | ${3}
    `('consume $frames frames given by ($times * ($childFrames + $interval))', (
        { frames, times, interval, childFrames }) => {
        // Given repeating progress
        const [fsClone, rsmClone] = createFiringStateAndRSM();
        const [state, rsm] = createFiringStateAndRSM(fsClone, rsmClone);

        // And gun consume childFrames
        const gun = createGunMockConsumeFrames(childFrames);

        // When play Repeat
        const repeat = new Repeat({ times, interval }, gun);
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
        const le = createLazyEvaluativeMockReturnOnce(expectedTimes);

        // When play Repeat
        const interval = 3;
        const repeat = new Repeat({ interval, times: le }, createGunMockConsumeFrames(0));
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
        const le = createLazyEvaluativeMockReturnOnce(expectedInterval);

        // When play Repeat
        const times = 3;
        const repeat = new Repeat({ times, interval: le }, createGunMockConsumeFrames(0));
        const progress = repeat.play(state);
        let consumedFrames = 0;
        while (true) {
            const r = progress.next();
            if (r.done) break;
            if (expectedInterval > 0 && consumedFrames % expectedInterval === 0) {
                expect(le.calc).lastCalledWith(fsClone);
                expect(le.calc).toReturnWith(expectedInterval);
                const expectedRepeated = 1 + consumedFrames / expectedInterval;
                expect(le.calc).toHaveBeenCalledTimes(expectedRepeated);
            }
            consumedFrames += 1;
        }

        // Then consume frames
        expect(consumedFrames).toBe(times * expectedInterval);
    });

    test('play gun at first frame of each repeating', () => {
        // Given repeating progress
        const [fsClone, rsmClone] = createFiringStateAndRSM();
        const [state, rsm] = createFiringStateAndRSM(fsClone, rsmClone);

        // And guns consume childFrames
        const childFrames = 3;
        const gun = createGunMockConsumeFrames(childFrames);

        // When play Repeat
        const times = 4;
        const interval = 6;
        const expectedFrames = times * (childFrames + interval);
        const gunStartFrames = range(expectedFrames).map(f => f % (childFrames + interval) === 0);

        const repeat = new Repeat({ times, interval }, gun);
        const progress = repeat.play(state);

        let consumedFrames = 0;
        let expectedFiredCount = 0;
        while (true) {
            const r = progress.next();

            // Then play guns at expected frames
            if (gunStartFrames[consumedFrames]) {
                expectedFiredCount += 1;
                expect(gun.play).lastCalledWith(fsClone);
            }
            expect(gun.play).toBeCalledTimes(expectedFiredCount);

            consumedFrames += 1;
            if (r.done) break;
        }
    });
});
