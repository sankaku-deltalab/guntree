import { Gun } from "../../gun";
import { FiringState } from "../../firing-state";
import { Owner } from "../../owner";
import { PlayerLike } from "../../player";

/**
 * Concat guns.
 * Child guns are played with FiringState without copy.
 */
export class Concat implements Gun {
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
      yield* gun.play(owner, player, state);
    }
  }
}
