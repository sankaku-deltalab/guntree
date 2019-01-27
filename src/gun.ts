import { IFiringState, TFireDataModifier } from './firing-state';

export interface IGun {
    play(state: IFiringState): IterableIterator<void>;
}

/**
 * ModifierGun modify fireData.
 */
export class ModifierGun implements IGun {
    constructor(private readonly modifyTiming: 'immediately' | 'later',
                private readonly modifierGenerator: (state: IFiringState) => TFireDataModifier) {}

    *play(state: IFiringState): IterableIterator<void> {
        const modifier = this.modifierGenerator(state);
        if (this.modifyTiming === 'immediately') {
            modifier(state, state.fireData);
        } else {
            state.pushModifier(modifier);
        }
    }
}

/**
 * Bullet express property of bullet.
 */
export interface IBullet {}
