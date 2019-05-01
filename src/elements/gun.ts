import { range } from "lodash";

import { IGun, IBullet } from "../gun";
import { IFiringState, IRepeatState } from "../firing-state";
import { TConstantOrLazy } from "../lazyEvaluative";
import {
  InvertTransformModifier,
  ModifierGun,
  SetMuzzleImmediatelyModifier
} from "./gunModifier";

export function* wait(frames: number): IterableIterator<void> {
  for (const _ of range(frames)) {
    yield;
  }
}

const getNumberFromLazy = (
  state: IFiringState,
  numberOrLazy: TConstantOrLazy<number>
): number => {
  if (typeof numberOrLazy === "number") return numberOrLazy;
  return numberOrLazy.calc(state);
};

/**
 * Fire bullet.
 */
export class Fire implements IGun {
  /** Bullet would fired */
  private readonly bullet: IBullet;

  /**
   * @param bullet Fired bullet
   */
  public constructor(bullet: IBullet) {
    this.bullet = bullet;
  }

  public *play(state: IFiringState): IterableIterator<void> {
    state.fire(this.bullet);
  }
}

/**
 * Do nothing.
 */
export class Nop implements IGun {
  public constructor() {}

  public *play(_state: IFiringState): IterableIterator<void> {}
}

export interface TRepeatOption {
  times: TConstantOrLazy<number>;
  interval: TConstantOrLazy<number>;
  name?: string;
}

export class Repeat implements IGun {
  private readonly option: TRepeatOption;
  private readonly gun: IGun;

  public constructor(option: TRepeatOption, gun: IGun) {
    this.option = option;
    this.gun = gun;
  }

  public *play(state: IFiringState): IterableIterator<void> {
    const name = this.option.name;
    const repeatTimes = this.calcRepeatTimes(state);
    const stateClones = range(repeatTimes).map(
      (): IFiringState => state.copy()
    );
    const repeatStates = stateClones.map(
      (clone, i): IRepeatState =>
        clone.repeatStates.start({ finished: i, total: repeatTimes }, name)
    );

    for (const i of range(repeatTimes)) {
      const clone = stateClones[i];
      yield* this.gun.play(clone);
      yield* wait(this.calcInterval(clone));
      clone.repeatStates.finish(repeatStates[i], name);
    }
  }

  private calcRepeatTimes(state: IFiringState): number {
    if (typeof this.option.times === "number") return this.option.times;
    return this.option.times.calc(state);
  }

  private calcInterval(state: IFiringState): number {
    if (typeof this.option.interval === "number") return this.option.interval;
    return this.option.interval.calc(state);
  }
}

export class ParallelRepeat implements IGun {
  private readonly option: TRepeatOption;
  private readonly gun: IGun;

  public constructor(option: TRepeatOption, gun: IGun) {
    this.option = option;
    this.gun = gun;
  }

  public *play(state: IFiringState): IterableIterator<void> {
    const repeatTimes = getNumberFromLazy(state, this.option.times);

    if (repeatTimes === 0) return;

    const name = this.option.name;

    const stateClones = range(repeatTimes).map(
      (): IFiringState => state.copy()
    );
    const repeatStates = stateClones.map(
      (clone, i): IRepeatState =>
        clone.repeatStates.start({ finished: i, total: repeatTimes }, name)
    );
    const intervals = stateClones.map(
      (s): number => getNumberFromLazy(s, this.option.interval)
    );
    const bootTimes = intervals.map(
      (_, idx, ary): number => {
        let cum = 0;
        for (const i in range(idx)) {
          cum += ary[i];
        }
        return cum;
      }
    );

    function* playChild(
      st: IFiringState,
      rs: IRepeatState,
      boot: number,
      interval: number,
      gun: IGun
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
      const doneList = playProgresses.map((p): boolean => p.next().done);
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
export class Concat implements IGun {
  private readonly guns: IGun[];

  public constructor(...guns: IGun[]) {
    this.guns = guns;
  }

  public *play(state: IFiringState): IterableIterator<void> {
    for (const gun of this.guns) {
      yield* gun.play(state);
    }
  }
}

/**
 * Play guns sequentially.
 * Each child guns are played with copied FiringState.
 */
export class Sequential implements IGun {
  private readonly guns: IGun[];

  public constructor(...guns: IGun[]) {
    this.guns = guns;
  }

  public *play(state: IFiringState): IterableIterator<void> {
    for (const gun of this.guns) {
      yield* gun.play(state.copy());
    }
  }
}

/**
 * Play guns parallel.
 * Each child guns are played with copied FiringState.
 */
export class Parallel implements IGun {
  private readonly guns: IGun[];

  public constructor(...guns: IGun[]) {
    this.guns = guns;
  }

  public *play(state: IFiringState): IterableIterator<void> {
    const progresses = this.guns.map(
      (g): IterableIterator<void> => g.play(state.copy())
    );
    while (true) {
      const doneList = progresses.map((p): boolean => p.next().done);
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
export class Wait implements IGun {
  private readonly frames: TConstantOrLazy<number>;

  public constructor(frames: TConstantOrLazy<number>) {
    this.frames = frames;
  }

  public *play(state: IFiringState): IterableIterator<void> {
    yield* wait(getNumberFromLazy(state, this.frames));
  }
}

export interface TMirrorOption {
  invertedMuzzleName?: string;
  mirrorTranslationX?: true;
  mirrorTranslationY?: true;
}

/**
 * Mirror play gun and inverted gun as parallel.
 * Mirror can use another muzzle for inverted gun.
 */
export class Mirror implements IGun {
  private readonly parallel: IGun;

  public constructor(option: TMirrorOption, gun: IGun) {
    const invert = new ModifierGun(
      true,
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
        new ModifierGun(
          false,
          new SetMuzzleImmediatelyModifier(option.invertedMuzzleName)
        )
      );
    }
    mirroredChild.push(invert);
    mirroredChild.push(gun);

    this.parallel = new Parallel(gun, new Concat(...mirroredChild));
  }

  public *play(state: IFiringState): IterableIterator<void> {
    yield* this.parallel.play(state);
  }
}

/**
 * Alternate play gun and inverted gun as sequential.
 * Alternate can use another muzzle for inverted gun.
 */
export class Alternate implements IGun {
  private readonly parallel: IGun;

  public constructor(option: TMirrorOption, gun: IGun) {
    const invert = new ModifierGun(
      true,
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
        new ModifierGun(
          false,
          new SetMuzzleImmediatelyModifier(option.invertedMuzzleName)
        )
      );
    }
    mirroredChild.push(invert);
    mirroredChild.push(gun);

    this.parallel = new Sequential(gun, new Concat(...mirroredChild));
  }

  public *play(state: IFiringState): IterableIterator<void> {
    yield* this.parallel.play(state);
  }
}
