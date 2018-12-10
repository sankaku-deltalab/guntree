import { range } from 'lodash';

import { IFiringState, IGun, IBullet } from 'guntree/gun';
import { ILazyEvaluative } from 'guntree/lazy-evaluative';

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

export type RepeatOption = {
    times: number | ILazyEvaluative<number>;
    interval: number | ILazyEvaluative<number>;
    name?: string;
};

export class Repeat implements IGun {
    constructor(private readonly option: RepeatOption,
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

export function* wait(frames: number): IterableIterator<void> {
    for (const _ of range(frames)) {
        yield;
    }
}
