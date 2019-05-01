import { IFiringState } from "./firing-state";

export interface IGun {
  play(state: IFiringState): IterableIterator<void>;
}

/**
 * Bullet express property of bullet.
 */
export interface IBullet {}
