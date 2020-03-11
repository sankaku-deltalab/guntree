import { range } from "lodash";

import { FiringState } from "guntree/firing-state";
import { RepeatingManager } from "guntree/repeating-manager";
import { Owner } from "guntree/owner";
import { ParallelRepeat } from "guntree/elements/gun";
import {
  createLazyEvaluativeMockReturnOnce,
  createGunMockConsumeFrames,
  createFiringStateMock,
  createRepeatStateManagerMock,
  simpleMock
} from "../util";

const createFiringStateWithRSM = (
  cloneNum: number
): [FiringState, FiringState[]] => {
  const stateClones = range(cloneNum).map(
    (): FiringState => {
      const rsm = createRepeatStateManagerMock();
      const state = createFiringStateMock();
      state.repeatStates = rsm;
      return state;
    }
  );
  const state = createFiringStateMock(...stateClones);
  state.repeatStates = createRepeatStateManagerMock(
    ...stateClones.map((s): RepeatingManager => s.repeatStates)
  );
  return [state, stateClones];
};

describe("#ParallelRepeat", (): void => {
  test.each`
    frames | times | interval
    ${0}   | ${0}  | ${0}
    ${0}   | ${1}  | ${0}
    ${0}   | ${0}  | ${1}
    ${1}   | ${1}  | ${1}
    ${5}   | ${5}  | ${1}
    ${6}   | ${1}  | ${6}
    ${14}  | ${2}  | ${7}
  `(
    "consume $frames frames when (times: $times, interval: $interval) if no child",
    ({ frames, times, interval }): void => {
      // Given repeating progress
      const [state, _stateClones] = createFiringStateWithRSM(times);

      // When play ParallelRepeat
      const repeat = new ParallelRepeat(
        { times, interval },
        createGunMockConsumeFrames(0)
      );
      const progress = repeat.play(simpleMock(), state);
      let consumedFrames = 0;
      while (true) {
        const r = progress.next();
        if (r.done) break;
        consumedFrames += 1;
      }

      // Then consume frames
      expect(consumedFrames).toBe(frames);
    }
  );

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
  `(
    "consume $frames frames given by (times * interval + (times !== 0) * childFrames)",
    ({ frames, times, interval, childFrames }): void => {
      // Given repeating progress
      const [state, _stateClones] = createFiringStateWithRSM(times);

      // And gun consume childFrames
      const gun = createGunMockConsumeFrames(childFrames);

      // When play ParallelRepeat
      const repeat = new ParallelRepeat({ times, interval }, gun);
      const progress = repeat.play(simpleMock(), state);
      let consumedFrames = 0;
      while (true) {
        const r = progress.next();
        if (r.done) break;
        consumedFrames += 1;
      }

      // Then consume frames
      expect(consumedFrames).toBe(frames);
    }
  );

  test("use lazyEvaluative to times", (): void => {
    // Given repeating progress
    const expectedTimes = 5;
    const [state, _stateClones] = createFiringStateWithRSM(expectedTimes);

    // And lazyEvaluative used for times
    const le = createLazyEvaluativeMockReturnOnce<number>(expectedTimes);

    // When play ParallelRepeat
    const interval = 3;
    const repeat = new ParallelRepeat(
      { interval, times: le },
      createGunMockConsumeFrames(0)
    );
    const progress = repeat.play(simpleMock(), state);
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

  test("use lazyEvaluative to interval", (): void => {
    // Given repeating progress
    const times = 3;
    const [state, stateClones] = createFiringStateWithRSM(times);

    // And lazyEvaluative used for interval
    const expectedInterval = 5;
    const le = createLazyEvaluativeMockReturnOnce(expectedInterval);

    // When play ParallelRepeat
    const repeat = new ParallelRepeat(
      { times, interval: le },
      createGunMockConsumeFrames(0)
    );
    const owner = simpleMock<Owner>();
    const progress = repeat.play(owner, state);
    while (true) {
      const r = progress.next();
      if (r.done) break;
    }

    // Then lazyEvaluative calculated with each state clones
    stateClones.map((clone): void => {
      expect(le.calc).toBeCalledWith(clone);
      expect(le.calc).toReturnWith(expectedInterval);
    });
  });

  test("play gun at first frame of each repeating", (): void => {
    // Given repeating progress
    const times = 4;
    const [state, stateClones] = createFiringStateWithRSM(times);

    // And guns consume childFrames
    const childFrames = 3;
    const childGun = createGunMockConsumeFrames(childFrames);

    // When play ParallelRepeat
    const interval = 6;
    const repeat = new ParallelRepeat({ times, interval }, childGun);
    const owner = simpleMock<Owner>();
    const progress = repeat.play(owner, state);

    const callFrames = range(times).map((i): number => i * interval);
    let consumedFrames = 0;
    let firedCount = 0;
    while (true) {
      const r = progress.next();

      // Then play guns at expected frames
      if (callFrames[firedCount] === consumedFrames) {
        expect(childGun.play).toBeCalledWith(owner, stateClones[firedCount]);
        firedCount += 1;
      }

      consumedFrames += 1;
      if (r.done) break;
    }
    expect(childGun.play).toBeCalledTimes(times);
  });
});
