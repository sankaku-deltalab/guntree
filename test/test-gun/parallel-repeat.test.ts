import { range } from 'lodash';

import { IRepeatState, IFiringState, IGun } from 'guntree/gun';
import { ParallelRepeat } from 'guntree/elements/gun';
import { ILazyEvaluative } from 'guntree/lazyEvaluative';

const createFiringStateMockClass = (): jest.Mock<IFiringState> => {
    return jest.fn<IFiringState>(() => {
        const fireState = {
            repeatingMap: new Map<String, IRepeatState>(),
            repeatingStack: (<IRepeatState[]> []),
            copy: jest.fn(),
            startRepeating: jest.fn().mockImplementation((state: IRepeatState, name?: string) => {
                if (name !== undefined) {
                    fireState.repeatingMap.set(name, state);
                }
                fireState.repeatingStack.push(state);
                return state;
            }),
            finishRepeating: jest.fn().mockImplementation((state: IRepeatState) => {
                if (fireState.repeatingStack.length === 0) throw new Error();
                if (fireState.repeatingStack[fireState.repeatingStack.length - 1] !== state) throw new Error();
                if (state.finished > state.total) throw new Error();
                fireState.repeatingStack.pop();
            }),
        };
        return fireState;
    });
};

const createFiringStateMocks = (cloneNum: number): [IFiringState, IFiringState[]] => {
    const stateMockClass = createFiringStateMockClass();
    const clones = range(cloneNum).map(_ => new stateMockClass());
    const state = new stateMockClass();
    for (const clone of clones) {
        (<jest.Mock> state.copy).mockReturnValueOnce(clone);
    }
    return [state, clones];
};

const createFiringStateMockClassSimple = (): jest.Mock<IFiringState> => {
    return jest.fn<IFiringState>((clone?: jest.Mock<IFiringState>) => {
        const fireState = {
            repeatingMap: new Map<String, IRepeatState>(),
            copy: jest.fn().mockReturnValue(clone),
            startRepeating: jest.fn(),
            finishRepeating: jest.fn(),
        };
        return fireState;
    });
};

const gunClass = jest.fn<IGun>((frame: number) => ({
    play: jest.fn().mockImplementation(() => {
        function* playing(): IterableIterator<void> {
            for (const _ of range(frame)) yield;
        }
        return playing();
    }),
}));

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
        const stateClass = createFiringStateMockClassSimple();
        const stateClone = new stateClass();
        const state = new stateClass(stateClone);

        // When play ParallelRepeat
        const repeat = new ParallelRepeat({ times, interval }, new gunClass(0));
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
        const stateClass = createFiringStateMockClassSimple();
        const stateClone2 = new stateClass();
        const stateClone = new stateClass(stateClone2);
        const state = new stateClass(stateClone);

        // And gun consume childFrames
        const gun = new gunClass(childFrames);

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
        const stateClass = createFiringStateMockClassSimple();
        const stateClone = new stateClass();
        const state = new stateClass(stateClone);

        // And lazyEvaluative used for times
        const expectedTimes = 5;
        const leClass = jest.fn<ILazyEvaluative<number>>((t: number) => ({
            calc: jest.fn().mockReturnValue(t),
        }));
        const le = new leClass(expectedTimes);

        // When play ParallelRepeat
        const interval = 3;
        const repeat = new ParallelRepeat({ interval, times: le }, new gunClass(0));
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
        const stateClass = createFiringStateMockClassSimple();
        const stateClone = new stateClass();
        const state = new stateClass(stateClone);

        // And lazyEvaluative used for interval
        const expectedInterval = 5;
        const leClass = jest.fn<ILazyEvaluative<number>>((t: number) => ({
            calc: jest.fn().mockReturnValue(t),
        }));
        const le = new leClass(expectedInterval);

        // When play ParallelRepeat
        const times = 3;
        const repeat = new ParallelRepeat({ times, interval: le }, new gunClass(0));
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
        const stateClass = createFiringStateMockClassSimple();
        const stateClone = new stateClass();
        const state = new stateClass(stateClone);

        // And guns consume childFrames
        const childFrames = 3;
        const gun = new gunClass(childFrames);

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
                expect(gun.play).lastCalledWith(stateClone);
            }
            expect(gun.play).toBeCalledTimes(expectedFiredCount);

            consumedFrames += 1;
            if (r.done) break;
        }
    });

    test.each`
    times | interval | name
    ${0}  | ${0}     | ${'a'}
    ${2}  | ${7}     | ${undefined}
    `('log repeating when {times: $times, interval: $interval, name: $name}', ({ times, interval, name }) => {
        // Given repeating progress
        const [state, stateClones] = createFiringStateMocks(times);

        // When play ParallelRepeat
        const repeat = new ParallelRepeat({ times, interval, name }, new gunClass(0));
        const progress = repeat.play(state);

        let consumedFrames = 0;
        while (true) {
            const r = progress.next();

            // Then notify start repeating to state
            if (consumedFrames === 0) {
                for (const i of range(times)) {
                    expect(stateClones[i].startRepeating).lastCalledWith({ finished: i, total: times }, name);
                }
            }

            if (r.done) break;
            consumedFrames += 1;
        }

        // And notify start and finish repeating only once at each clones
        for (const i of range(times)) {
            expect(stateClones[i].startRepeating).toBeCalledTimes(1);
            expect(stateClones[i].finishRepeating).toBeCalledTimes(1);
        }
    });
});
