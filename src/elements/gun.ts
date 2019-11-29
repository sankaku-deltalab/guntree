import { range } from "lodash";

import { Gun } from "../gun";
import { Bullet } from "../bullet";
import { FiringState, RepeatState } from "../firing-state";
import { TConstantOrLazy } from "../lazyEvaluative";
import { InvertTransformModifier, ModifierGun } from "./gunModifier";
import { UseMuzzleUpdater, SetterGun } from "./gunSetter";

export function* wait(frames: number): IterableIterator<void> {
  for (const _ of range(frames)) {
    yield;
  }
}

const getNumberFromLazy = (
  state: FiringState,
  numberOrLazy: TConstantOrLazy<number>
): number => {
  if (typeof numberOrLazy === "number") return numberOrLazy;
  return numberOrLazy.calc(state);
};

/**
 * Fire bullet.
 */
export class Fire implements Gun {
  /** Bullet would fired */
  private readonly bullet: Bullet;

  /**
   * @param bullet Fired bullet
   */
  public constructor(bullet: Bullet) {
    this.bullet = bullet;
  }

  public *play(state: FiringState): IterableIterator<void> {
    state.fire(this.bullet);
  }
}

/**
 * Do nothing.
 */
export class Nop implements Gun {
  public *play(_state: FiringState): IterableIterator<void> {
    /** Do nothing */
  }
}

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

  public *play(state: FiringState): IterableIterator<void> {
    const name = this.option.name;
    const repeatTimes = this.calcRepeatTimes(state);
    const stateClones = range(repeatTimes).map((): FiringState => state.copy());
    const repeatStates = stateClones.map(
      (clone, i): RepeatState =>
        clone.repeatStates.start({ finished: i, total: repeatTimes }, name)
    );

    for (const i of range(repeatTimes)) {
      const clone = stateClones[i];
      yield* this.gun.play(clone);
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

export class ParallelRepeat implements Gun {
  private readonly option: TRepeatOption;
  private readonly gun: Gun;

  public constructor(option: TRepeatOption, gun: Gun) {
    this.option = option;
    this.gun = gun;
  }

  public *play(state: FiringState): IterableIterator<void> {
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
      yield* gun.play(st);
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

/**
 * Concat guns.
 * Child guns are played with FiringState without copy.
 */
export class Concat implements Gun {
  private readonly guns: Gun[];

  public constructor(...guns: Gun[]) {
    this.guns = guns;
  }

  public *play(state: FiringState): IterableIterator<void> {
    for (const gun of this.guns) {
      yield* gun.play(state);
    }
  }
}

/**
 * Play guns sequentially.
 * Each child guns are played with copied FiringState.
 */
export class Sequential implements Gun {
  private readonly guns: Gun[];

  public constructor(...guns: Gun[]) {
    this.guns = guns;
  }

  public *play(state: FiringState): IterableIterator<void> {
    for (const gun of this.guns) {
      yield* gun.play(state.copy());
    }
  }
}

/**
 * Play guns parallel.
 * Each child guns are played with copied FiringState.
 */
export class Parallel implements Gun {
  private readonly guns: Gun[];

  public constructor(...guns: Gun[]) {
    this.guns = guns;
  }

  public *play(state: FiringState): IterableIterator<void> {
    const progresses = this.guns.map(
      (g): IterableIterator<void> => g.play(state.copy())
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

/**
 * Wait input frames.
 */
export class Wait implements Gun {
  private readonly frames: TConstantOrLazy<number>;

  public constructor(frames: TConstantOrLazy<number>) {
    this.frames = frames;
  }

  public *play(state: FiringState): IterableIterator<void> {
    yield* wait(getNumberFromLazy(state, this.frames));
  }
}

/**
 * Mirror firing option.
 */
export interface TMirrorOption {
  /** Muzzle name used for inverted firing. */
  invertedMuzzleName?: string;
  /** Mirror firing translation x. */
  mirrorTranslationX?: true;
  /** Mirror firing translation y. */
  mirrorTranslationY?: true;
}

/**
 * Mirror play gun and inverted gun as parallel.
 * Mirror can use another muzzle for inverted gun.
 */
export class Mirror implements Gun {
  private readonly parallel: Gun;

  public constructor(option: TMirrorOption, gun: Gun) {
    const invert = new ModifierGun(
      new InvertTransformModifier({
        angle: true,
        translationX: option.mirrorTranslationX,
        translationY: option.mirrorTranslationY
      })
    );
    const mirroredChild = [];
    // Set muzzle if name was specified
    if (option.invertedMuzzleName !== undefined) {
      mirroredChild.push(
        new SetterGun(new UseMuzzleUpdater(option.invertedMuzzleName))
      );
    }
    mirroredChild.push(invert);
    mirroredChild.push(gun);

    this.parallel = new Parallel(gun, new Concat(...mirroredChild));
  }

  public *play(state: FiringState): IterableIterator<void> {
    yield* this.parallel.play(state);
  }
}

/**
 * Alternate play gun and inverted gun as sequential.
 * Alternate can use another muzzle for inverted gun.
 */
export class Alternate implements Gun {
  private readonly parallel: Gun;

  public constructor(option: TMirrorOption, gun: Gun) {
    const invert = new ModifierGun(
      new InvertTransformModifier({
        angle: true,
        translationX: option.mirrorTranslationX,
        translationY: option.mirrorTranslationY
      })
    );
    const mirroredChild = [];
    // Set muzzle if name was specified
    if (option.invertedMuzzleName !== undefined) {
      mirroredChild.push(
        new SetterGun(new UseMuzzleUpdater(option.invertedMuzzleName))
      );
    }
    mirroredChild.push(invert);
    mirroredChild.push(gun);

    this.parallel = new Sequential(gun, new Concat(...mirroredChild));
  }

  public *play(state: FiringState): IterableIterator<void> {
    yield* this.parallel.play(state);
  }
}
