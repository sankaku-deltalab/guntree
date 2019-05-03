import { FiringState } from "./firing-state";

export interface Gun {
  play(state: FiringState): IterableIterator<void>;
}
