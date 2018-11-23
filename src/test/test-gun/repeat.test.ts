import { range } from 'lodash';

import { IRepeatState, IFiringState, IGun, Repeat } from 'guntree/gun';

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
        const repeat = new Repeat({ times, interval });
        const progress = repeat.play(state);
        let consumedFrames = 0;
        while (true) {
            const r = progress.next();
            if (r.done) break;
            consumedFrames += 1;
        }

        // Then consume frames
        expect(consumedFrames).toBeCloseTo(frames);
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
        const gunClass = jest.fn<IGun>(() => ({
            play: jest.fn().mockImplementation(() => {
                function* playing(): IterableIterator<void> {
                    for (const _ of range(childFrames)) yield;
                }
                return playing();
            }),
        }));
        const gun = new gunClass();

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
        expect(consumedFrames).toBeCloseTo(frames);
    });

    test.each`
    frames | times | interval | childFrames1 | childFrames2
    ${0}   | ${0}  | ${0}     | ${0}         | ${0}
    ${22}  | ${2}  | ${7}     | ${3}         | ${1}
    `('consume $frames frames with 2 child guns given by ($times * ($childFrames1 * $childFrames2 + $interval))', (
        { frames, times, interval, childFrames1, childFrames2 }) => {
        // Given repeating progress
        const stateClass = createFiringStateMockClass();
        const stateClone2 = new stateClass();
        const stateClone = new stateClass(stateClone2);
        const state = new stateClass(stateClone);

        // And gun consume childFrames
        const gunClass = jest.fn<IGun>((frames: number) => ({
            play: jest.fn().mockImplementation(() => {
                function* playing(): IterableIterator<void> {
                    for (const _ of range(frames)) yield;
                }
                return playing();
            }),
        }));
        const gun1 = new gunClass(childFrames1);
        const gun2 = new gunClass(childFrames2);

        // When play Repeat
        const repeat = new Repeat({ times, interval }, gun1, gun2);
        const progress = repeat.play(state);
        let consumedFrames = 0;
        while (true) {
            const r = progress.next();
            if (r.done) break;
            consumedFrames += 1;
        }

        // Then consume frames
        expect(consumedFrames).toBeCloseTo(frames);
    });
});
