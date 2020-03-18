import { Gun } from "../../gun";
import { FiringState } from "../../firing-state";
import { Owner } from "../../owner";
import { PlayerLike } from "../../player";

export interface FiringStateUpdater {
  updateFiringState(owner: Owner, state: FiringState): void;
}

/**
 * SetterGun update FiringState when played.
 * Played and effects before fired.
 */
export class SetterGun implements Gun {
  private readonly updater: FiringStateUpdater;

  /**
   * @param updater Used when played.
   */
  public constructor(updater: FiringStateUpdater) {
    this.updater = updater;
  }

  public *play(
    owner: Owner,
    player: PlayerLike,
    state: FiringState
  ): IterableIterator<void> {
    this.updater.updateFiringState(owner, state);
  }
}
