import { Matrix } from "transformation-matrix";
import { FiringState } from "./firing-state";

export interface LazyEvaluative<T> {
  /**
   * Calculate value for gun
   * @param state Current firing state
   */
  calc(state: FiringState): T;
}

export type TConstantOrLazy<T> = T | LazyEvaluative<T>;

export const calcValueFromConstantOrLazy = <T = number | string>(
  stateConst: FiringState,
  value: TConstantOrLazy<T>
): T => {
  if (typeof value === "number") return value;
  if (typeof value === "string") return value;
  return (value as LazyEvaluative<T>).calc(stateConst);
};

export const calcTransFormFromConstantOrLazy = (
  stateConst: FiringState,
  value: TConstantOrLazy<Matrix>
): Matrix => {
  if ("calc" in value) return value.calc(stateConst);
  return value;
};
