import { simpleMock } from "../util";
import { RepeatStateManager, FiringState } from "guntree/firing-state";

export const createRepeatStateManagerWithGet = (
  getFunc: jest.Mock
): RepeatStateManager => {
  const rsm = simpleMock<RepeatStateManager>();
  rsm.get = getFunc;
  return rsm;
};

export const createFiringStateWithRSM = (
  rsm: RepeatStateManager
): FiringState => {
  const state = simpleMock<FiringState>();
  state.repeatStates = rsm;
  return state;
};
