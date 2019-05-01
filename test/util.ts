import { range } from "lodash";

import { IGun } from "guntree/gun";
import { ILazyEvaluative } from "guntree/lazyEvaluative";
import {
  IFiringState,
  IRepeatStateManager,
  IRepeatState
} from "guntree/firing-state";

export const simpleMock = <T>(): T => {
  const cls = jest.fn<T, []>();
  return new cls();
};

export const createLazyEvaluativeMockReturnOnce = <T>(
  value: T
): ILazyEvaluative<T> => {
  const le = simpleMock<ILazyEvaluative<T>>();
  le.calc = jest.fn().mockReturnValueOnce(value);
  return le;
};

export const createGunMockConsumeFrames = (frames: number): IGun => {
  const gun = simpleMock<IGun>();
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
  ...clones: IFiringState[]
): IFiringState => {
  const state = simpleMock<IFiringState>();
  let copyFunction = jest.fn();
  clones.map(
    (clone): void => {
      copyFunction = copyFunction.mockReturnValueOnce(clone);
    }
  );
  state.copy = copyFunction;
  state.pushModifier = jest.fn();
  return state;
};

export const createRepeatStateManagerMock = (
  ...clones: IRepeatStateManager[]
): IRepeatStateManager => {
  const rsm = simpleMock<IRepeatStateManager>();
  let copyFunction = jest.fn();
  clones.map(
    (clone): void => {
      copyFunction = copyFunction.mockReturnValueOnce(clone);
    }
  );
  rsm.copy = copyFunction;
  rsm.start = jest
    .fn()
    .mockImplementation((rs: IRepeatState): IRepeatState => rs);
  rsm.finish = jest.fn();
  return rsm;
};
