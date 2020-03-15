import { range } from "lodash";
import { FiringState } from "../../firing-state";
import { TConstantOrLazy } from "../../lazyEvaluative";

export function* wait(frames: number): IterableIterator<void> {
  for (const _ of range(frames)) {
    yield;
  }
}

export const getNumberFromLazy = (
  state: FiringState,
  numberOrLazy: TConstantOrLazy<number>
): number => {
  if (typeof numberOrLazy === "number") return numberOrLazy;
  return numberOrLazy.calc(state);
};
