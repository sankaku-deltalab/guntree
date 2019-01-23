import { IFiringState } from './firing-state';

export type TVector2D = {
    x: number,
    y: number,
};

export interface IGun {
    play(state: IFiringState): IterableIterator<void>;
}

/**
 * Bullet express property of bullet.
 */
export interface IBullet {}
