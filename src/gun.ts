import { FiringState } from "./firing-state";
import { Owner } from "./owner";
import { PlayerLike } from "./player";

export interface Gun {
  play(
    owner: Owner,
    player: PlayerLike,
    state: FiringState
  ): IterableIterator<void>;
}
