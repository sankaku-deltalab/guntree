import { Gun } from "../../gun";
import { FiringState } from "../../firing-state";
import { TConstantOrLazy } from "../../lazyEvaluative";
import { Owner } from "guntree/owner";
import { PlayerLike } from "guntree/player";
import { wait, getNumberFromLazy } from "./util";

/**
 * Wait input frames.
 */
export class Wait implements Gun {
  private readonly frames: TConstantOrLazy<number>;

  public constructor(frames: TConstantOrLazy<number>) {
    this.frames = frames;
  }

  public *play(
    _owner: Owner,
    player: PlayerLike,
    state: FiringState
  ): IterableIterator<void> {
    yield* wait(getNumberFromLazy(state, this.frames));
  }
}
