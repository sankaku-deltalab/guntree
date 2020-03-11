import { simpleMock } from "../util";
import { FiringState } from "guntree/firing-state";
import { RepeatingManager } from "guntree/repeating-manager";

export const createRepeatStateManagerWithGet = (
  getFunc: jest.Mock
): RepeatingManager => {
  const rsm = simpleMock<RepeatingManager>();
  rsm.get = getFunc;
  return rsm;
};

export const createFiringStateWithRSM = (
  rsm: RepeatingManager
): FiringState => {
  const state = simpleMock<FiringState>();
  state.repeatStates = rsm;
  return state;
};
