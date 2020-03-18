import { Gun } from "../../gun";
import { FiringState } from "../../firing-state";
import { Owner } from "../../owner";
import { PlayerLike } from "../../player";

/**
 * Play guns parallel.
 * Each child guns are played with copied FiringState.
 */
export class Parallel implements Gun {
  private readonly guns: Gun[];

  public constructor(...guns: Gun[]) {
    this.guns = guns;
  }

  public *play(
    owner: Owner,
    player: PlayerLike,
    state: FiringState
  ): IterableIterator<void> {
    const progresses = this.guns.map(
      (g): IterableIterator<void> => g.play(owner, player, state.copy())
    );
    while (true) {
      const doneList = progresses.map((p): boolean => p.next().done !== false);
      const allFinished = doneList.reduce(
        (done1, done2): boolean => done1 && done2
      );
      if (allFinished) return;
      yield;
    }
  }
}
