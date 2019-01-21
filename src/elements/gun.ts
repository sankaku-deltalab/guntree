import { range } from 'lodash';

import { IFiringState, IRepeatState, IGun, IBullet } from '../gun';
import { TConstantOrLazy } from '../lazyEvaluative';

/**
 * Fire bullet.
 */
export class Fire implements IGun {
    /**
     * @param bullet Fired bullet
     */
    constructor(private readonly bullet: IBullet) {}

    *play(state: IFiringState): IterableIterator<void> {
        state.player.notifyFired(state, this.bullet);
    }
}

export type TRepeatOption = {
    times: TConstantOrLazy<number>;
    interval: TConstantOrLazy<number>;
    name?: string;
};

export class Repeat implements IGun {
    constructor(private readonly option: TRepeatOption,
                private readonly gun: IGun) {}

    *play(state: IFiringState): IterableIterator<void> {
        const repeatTimes = this.calcRepeatTimes(state);
        const stateClone = state.copy();

        const repeatState = stateClone.startRepeating({ finished: 0, total: repeatTimes }, this.option.name);
        for (const _ of range(repeatTimes)) {
            yield* this.gun.play(stateClone);
            yield* wait(this.calcInterval(stateClone));
            repeatState.finished += 1;
        }
        stateClone.finishRepeating(repeatState, this.option.name);
    }

    private calcRepeatTimes(state: IFiringState) {
        if (typeof this.option.times === 'number') return this.option.times;
        return this.option.times.calc(state);
    }

    private calcInterval(state: IFiringState) {
        if (typeof this.option.interval === 'number') return this.option.interval;
        return this.option.interval.calc(state);
    }
}

export class ParallelRepeat implements IGun {
    constructor(private readonly option: TRepeatOption,
                private readonly gun: IGun) {}

    *play(state: IFiringState): IterableIterator<void> {
        const repeatTimes = getNumberFromLazy(state, this.option.times);

        if (repeatTimes === 0) return;

        const name = this.option.name;

        const stateClones = range(repeatTimes).map(_ => state.copy());
        const repeatStates = stateClones.map(
            (clone, i) => clone.startRepeating({ finished: i, total: repeatTimes }, name));
        const intervals = stateClones.map(s => getNumberFromLazy(s, this.option.interval));
        const bootTimes = intervals.map((_, idx, ary) => {
            let cum = 0;
            for (const i in range(idx)) {
                cum += ary[i];
            }
            return cum;
        });

        function* playChild(st: IFiringState,
                            rs: IRepeatState,
                            boot: number,
                            interval: number,
                            gun: IGun): IterableIterator<void> {
            yield* wait(boot);
            yield* gun.play(st);
            yield* wait(interval);
            st.finishRepeating(rs, name);
        }

        const playProgresses = range(repeatTimes).map((i) => {
            return playChild(stateClones[i], repeatStates[i], bootTimes[i], intervals[i], this.gun);
        });

        while (true) {
            const doneList = playProgresses.map(p => p.next().done);
            const allFinished = doneList.reduce((done1, done2) => done1 && done2);
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

    constructor(...guns: IGun[]) {
        this.guns = guns;
    }

    *play(state: IFiringState): IterableIterator<void> {
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

    constructor(...guns: IGun[]) {
        this.guns = guns;
    }

    *play(state: IFiringState): IterableIterator<void> {
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

    constructor(...guns: IGun[]) {
        this.guns = guns;
    }

    *play(state: IFiringState): IterableIterator<void> {
        const progresses = this.guns.map(g => g.play(state.copy()));
        while (true) {
            const doneList = progresses.map(p => p.next().done);
            const allFinished = doneList.reduce((done1, done2) => done1 && done2);
            if (allFinished) return;
            yield;
        }
    }
}

/**
 * Wait input frames.
 */
export class Wait implements IGun {
    constructor(private readonly frames: TConstantOrLazy<number>) {}

    *play(state: IFiringState): IterableIterator<void> {
        yield* wait(getNumberFromLazy(state, this.frames));
    }
}

const getNumberFromLazy = (state: IFiringState,
                           numberOrLazy: TConstantOrLazy<number>): number => {
    if (typeof numberOrLazy === 'number') return numberOrLazy;
    return numberOrLazy.calc(state);

};

export function* wait(frames: number): IterableIterator<void> {
    for (const _ of range(frames)) {
        yield;
    }
}
