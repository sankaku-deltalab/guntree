import { FiringState } from "./firing-state";
import { Owner } from "./owner";

export interface Gun {
  play(owner: Owner, state: FiringState): IterableIterator<void>;
}
