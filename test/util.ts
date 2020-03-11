import { range } from "lodash";

import { Gun } from "guntree/gun";
import { LazyEvaluative } from "guntree/lazyEvaluative";
import { FiringState } from "guntree/firing-state";
import { RepeatingManager, RepeatState } from "guntree/repeating-manager";
import { Owner } from "guntree/owner";

export const simpleMock = <T>(): T => {
  const cls = jest.fn<T, []>();
  return new cls();
};

export const createLazyEvaluativeMockReturnOnce = <T>(
  value: T
): LazyEvaluative<T> => {
  const le = simpleMock<LazyEvaluative<T>>();
  le.calc = jest.fn().mockReturnValueOnce(value);
  return le;
};

export const createGunMockConsumeFrames = (frames: number): Gun => {
  const gun = simpleMock<Gun>();
  gun.play = jest.fn().mockImplementation(
    (): IterableIterator<void> => {
      function* playing(): IterableIterator<void> {
        for (const _ of range(frames)) yield;
      }
      return playing();
    }
  );
  return gun;
};

export const createGunMockWithCallback = (
  callback: (owner: Owner, state: FiringState) => void
): Gun => {
  const gun = simpleMock<Gun>();
  gun.play = jest.fn().mockImplementation(
    (owner: Owner, state: FiringState): IterableIterator<void> => {
      function* playing(): IterableIterator<void> {
        callback(owner, state);
      }
      return playing();
    }
  );
  return gun;
};

export const createFiringStateMock = (
  ...clones: FiringState[]
): FiringState => {
  const state = simpleMock<FiringState>();
  let copyFunction = jest.fn();
  clones.map((clone): void => {
    copyFunction = copyFunction.mockReturnValueOnce(clone);
  });
  state.copy = copyFunction;
  state.pushModifier = jest.fn();
  return state;
};

export const createRepeatStateManagerMock = (
  ...clones: RepeatingManager[]
): RepeatingManager => {
  const rsm = simpleMock<RepeatingManager>();
  let copyFunction = jest.fn();
  clones.map((clone): void => {
    copyFunction = copyFunction.mockReturnValueOnce(clone);
  });
  rsm.copy = copyFunction;
  rsm.start = jest
    .fn()
    .mockImplementation((rs: RepeatState): RepeatState => rs);
  rsm.finish = jest.fn();
  return rsm;
};
