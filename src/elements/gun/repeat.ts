import { range } from "lodash";
import { Gun } from "../../gun";
import { FiringState } from "../../firing-state";
import { TConstantOrLazy } from "../../lazyEvaluative";
import { RepeatState } from "../../repeating-manager";
import { Owner } from "../../owner";
import { PlayerLike } from "../../player";
import { wait } from "./util";

/**
 * Repeat firing properties.
 */
export interface TRepeatOption {
  /** Repeat times. */
  times: TConstantOrLazy<number>;
  /** Repeat interval. */
  interval: TConstantOrLazy<number>;
  /** Repeating name. Used by LazyEvaluative. */
  name?: string;
}

export class Repeat implements Gun {
  private readonly option: TRepeatOption;
  private readonly gun: Gun;

  public constructor(option: TRepeatOption, gun: Gun) {
    this.option = option;
    this.gun = gun;
  }

  public *play(
    owner: Owner,
    player: PlayerLike,
    state: FiringState
  ): IterableIterator<void> {
    const name = this.option.name;
    const repeatTimes = this.calcRepeatTimes(state);
    const stateClones = range(repeatTimes).map((): FiringState => state.copy());
    const repeatStates = stateClones.map(
      (clone, i): RepeatState =>
        clone.repeatStates.start({ finished: i, total: repeatTimes }, name)
    );

    for (const i of range(repeatTimes)) {
      const clone = stateClones[i];
      yield* this.gun.play(owner, player, clone);
      yield* wait(this.calcInterval(clone));
      clone.repeatStates.finish(repeatStates[i], name);
    }
  }

  private calcRepeatTimes(state: FiringState): number {
    if (typeof this.option.times === "number") return this.option.times;
    return this.option.times.calc(state);
  }

  private calcInterval(state: FiringState): number {
    if (typeof this.option.interval === "number") return this.option.interval;
    return this.option.interval.calc(state);
  }
}
