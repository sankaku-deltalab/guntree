import { range } from "lodash";

import { Gun } from "guntree/gun";
import { LazyEvaluative } from "guntree/lazyEvaluative";
import {
  FiringState,
  RepeatStateManager,
  RepeatState
} from "guntree/firing-state";

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
  ...clones: RepeatStateManager[]
): RepeatStateManager => {
  const rsm = simpleMock<RepeatStateManager>();
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
