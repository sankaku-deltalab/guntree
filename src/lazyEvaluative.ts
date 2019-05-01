import { Matrix } from "transformation-matrix";
import { IFiringState } from "./firing-state";

export interface ILazyEvaluative<T> {
  /**
   * Calculate value for gun
   * @param state Current firing state
   */
  calc(state: IFiringState): T;
}

export type TConstantOrLazy<T> = T | ILazyEvaluative<T>;

export const calcValueFromConstantOrLazy = <T = number | string>(
  stateConst: IFiringState,
  value: TConstantOrLazy<T>
): T => {
  if (typeof value === "number") return value;
  if (typeof value === "string") return value;
  return (value as ILazyEvaluative<T>).calc(stateConst);
};

export const calcTransFormFromConstantOrLazy = (
  stateConst: IFiringState,
  value: TConstantOrLazy<Matrix>
): Matrix => {
  if ("calc" in value) return value.calc(stateConst);
  return value;
};
