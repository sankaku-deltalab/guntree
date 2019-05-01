import { simpleMock } from "../util";
import { IRepeatStateManager, IFiringState } from "guntree/firing-state";

export const createRepeatStateManagerWithGet = (
  getFunc: jest.Mock
): IRepeatStateManager => {
  const rsm = simpleMock<IRepeatStateManager>();
  rsm.get = getFunc;
  return rsm;
};

export const createFiringStateWithRSM = (
  rsm: IRepeatStateManager
): IFiringState => {
  const state = simpleMock<IFiringState>();
  state.repeatStates = rsm;
  return state;
};
