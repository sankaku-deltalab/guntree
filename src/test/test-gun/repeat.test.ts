import { range } from 'lodash';

import { IRepeatState, IFiringState, IGun } from 'guntree/gun';
import { Repeat } from 'guntree/contents/gun';
import { ILazyEvaluative } from 'guntree/lazy-evaluative';

const createFiringStateMockClass = (): jest.Mock<IFiringState> => {
    return jest.fn<IFiringState>((clone?: jest.Mock<IFiringState>) => {
        const fireState = {
            repeatingMap: new Map<String, IRepeatState>(),
            repeatingStack: (<IRepeatState[]> []),
            copy: jest.fn().mockReturnValue(clone),
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

const gunClass = jest.fn<IGun>((frame: number) => ({
    play: jest.fn().mockImplementation(() => {
        function* playing(): IterableIterator<void> {
            for (const _ of range(frame)) yield;
        }
        return playing();
    }),
}));

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
        const stateClass = createFiringStateMockClass();
        const stateClone = new stateClass();
        const state = new stateClass(stateClone);

        // When play Repeat
        const repeat = new Repeat({ times, interval }, new gunClass(0));
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
        const stateClass = createFiringStateMockClass();
        const stateClone2 = new stateClass();
        const stateClone = new stateClass(stateClone2);
        const state = new stateClass(stateClone);

        // And gun consume childFrames
        const gun = new gunClass(childFrames);

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

    test('use lazy-evaluative to times', () => {
        // Given repeating progress
        const stateClass = createFiringStateMockClass();
        const stateClone = new stateClass();
        const state = new stateClass(stateClone);

        // And lazy-evaluative used for times
        const expectedTimes = 5;
        const leClass = jest.fn<ILazyEvaluative<number>>((t: number) => ({
            calc: jest.fn().mockReturnValue(t),
        }));
        const le = new leClass(expectedTimes);

        // When play Repeat
        const interval = 3;
        const repeat = new Repeat({ interval, times: le }, new gunClass(0));
        const progress = repeat.play(state);
        let consumedFrames = 0;
        while (true) {
            const r = progress.next();
            if (r.done) break;

            // Then lazy-evaluative was evaluated at only first frame
            if (consumedFrames === 0) {
                expect(le.calc).toBeCalledTimes(1);
                expect(le.calc).lastCalledWith(state);
                expect(le.calc).toReturnWith(expectedTimes);
            }

            consumedFrames += 1;
        }

        // Then consume frames
        expect(consumedFrames).toBe(expectedTimes * interval);

        // And lazy-evaluative was evaluated only once time
        expect(le.calc).toBeCalledTimes(1);
    });

    test('use lazy-evaluative to interval', () => {
        // Given repeating progress
        const stateClass = createFiringStateMockClass();
        const stateClone = new stateClass();
        const state = new stateClass(stateClone);

        // And lazy-evaluative used for interval
        const expectedInterval = 5;
        const leClass = jest.fn<ILazyEvaluative<number>>((t: number) => ({
            calc: jest.fn().mockReturnValue(t),
        }));
        const le = new leClass(expectedInterval);

        // When play Repeat
        const times = 3;
        const repeat = new Repeat({ times, interval: le }, new gunClass(0));
        const progress = repeat.play(state);
        let consumedFrames = 0;
        while (true) {
            const r = progress.next();
            if (r.done) break;
            if (expectedInterval > 0 && consumedFrames % expectedInterval === 0) {
                expect(le.calc).lastCalledWith(stateClone);
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
        const stateClass = createFiringStateMockClass();
        const stateClone = new stateClass();
        const state = new stateClass(stateClone);

        // And guns consume childFrames
        const childFrames = 3;
        const gun = new gunClass(childFrames);

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
    ${2}  | ${7}     | ${undefined}
    `('log repeating when {times: $times, interval: $interval, name: $name}', ({ times, interval, name }) => {
        // Given repeating progress
        const stateClass = createFiringStateMockClass();
        const stateClone = new stateClass();
        const state = new stateClass(stateClone);

        // When play Repeat
        const repeat = new Repeat({ times, interval, name }, new gunClass(0));
        const progress = repeat.play(state);

        let consumedFrames = 0;
        while (true) {
            const r = progress.next();

            // Then notify start repeating to state
            if (consumedFrames === 0) {
                expect(stateClone.startRepeating).lastCalledWith({ finished: 0, total: times }, name);
            }

            // And update repeating state and notify finish repeating
            if (consumedFrames < times * interval) {
                const expectedRepeated = Math.floor(consumedFrames / interval);
                expect((<any> stateClone).repeatingStack[0]).toEqual({ finished: expectedRepeated, total: times });
            } else {
                expect(stateClone.finishRepeating).toBeCalledWith({ finished: times, total: times }, name);
                expect(r.done).toBe(true);
            }

            if (r.done) break;
            consumedFrames += 1;

            // And not notify finish repeating while repeating
            expect(stateClone.finishRepeating).not.toBeCalled();
        }

        // And notify start and finish repeating only once
        expect(stateClone.startRepeating).toBeCalledTimes(1);
        expect(stateClone.finishRepeating).toBeCalledTimes(1);
    });
});
