import { Gun } from "../../gun";
import { FiringState } from "../../firing-state";
import { Owner } from "../../owner";
import { PlayerLike } from "../../player";

/**
 * Do nothing.
 */
export class Nop implements Gun {
  public *play(
    _owner: Owner,
    _player: PlayerLike,
    _state: FiringState
  ): IterableIterator<void> {
    /** Do nothing */
  }
}
