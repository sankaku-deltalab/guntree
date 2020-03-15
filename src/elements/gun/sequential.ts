import { Gun } from "../../gun";
import { FiringState } from "../../firing-state";
import { Owner } from "guntree/owner";
import { PlayerLike } from "guntree/player";

/**
 * Play guns sequentially.
 * Each child guns are played with copied FiringState.
 */
export class Sequential implements Gun {
  private readonly guns: Gun[];

  public constructor(...guns: Gun[]) {
    this.guns = guns;
  }

  public *play(
    owner: Owner,
    player: PlayerLike,
    state: FiringState
  ): IterableIterator<void> {
    for (const gun of this.guns) {
      yield* gun.play(owner, player, state.copy());
    }
  }
}
