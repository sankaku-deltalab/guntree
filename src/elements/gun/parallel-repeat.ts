import { range } from "lodash";
import { Gun } from "../../gun";
import { FiringState } from "../../firing-state";
import { RepeatState } from "../../repeating-manager";
import { Owner } from "../../owner";
import { PlayerLike } from "../../player";
import { wait, getNumberFromLazy } from "./util";
import { TRepeatOption } from "./repeat";

export class ParallelRepeat implements Gun {
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
    const repeatTimes = getNumberFromLazy(state, this.option.times);

    if (repeatTimes === 0) return;

    const name = this.option.name;

    const stateClones = range(repeatTimes).map((): FiringState => state.copy());
    const repeatStates = stateClones.map(
      (clone, i): RepeatState =>
        clone.repeatStates.start({ finished: i, total: repeatTimes }, name)
    );
    const intervals = stateClones.map((s): number =>
      getNumberFromLazy(s, this.option.interval)
    );
    const bootTimes = intervals.map((_, idx, ary): number => {
      let cum = 0;
      for (const i in range(idx)) {
        cum += ary[i];
      }
      return cum;
    });

    function* playChild(
      st: FiringState,
      rs: RepeatState,
      boot: number,
      interval: number,
      gun: Gun
    ): IterableIterator<void> {
      yield* wait(boot);
      yield* gun.play(owner, player, st);
      yield* wait(interval);
      st.repeatStates.finish(rs, name);
    }

    const playProgresses = range(repeatTimes).map(
      (i): IterableIterator<void> => {
        return playChild(
          stateClones[i],
          repeatStates[i],
          bootTimes[i],
          intervals[i],
          this.gun
        );
      }
    );

    while (true) {
      const doneList = playProgresses.map(
        (p): boolean => p.next().done !== false
      );
      const allFinished = doneList.reduce(
        (done1, done2): boolean => done1 && done2
      );
      if (allFinished) return;
      yield;
    }
  }
}
