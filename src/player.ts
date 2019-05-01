import { IGun } from "./gun";
import {
  IFiringState,
  FiringState,
  FireData,
  RepeatStateManager
} from "./firing-state";
import { IMuzzle } from "./muzzle";

/**
 * Player play guntree.
 */
export interface IPlayer {
  /** Is playing guntree. */
  isRunning: boolean;

  /**
   * Get muzzle by name.
   * Muzzles owned by player should be defined by user.
   *
   * @param muzzleName Muzzle name
   */
  getMuzzle(muzzleName: string): IMuzzle;

  /**
   * Set guntree.
   *
   * @param gunTree Setting guntree. Guntree can used by multiple player.
   */
  setGunTree(gunTree: IGun): void;

  /**
   * Start playing guntree.
   */
  start(): void;

  /**
   * Continue playing guntree.
   * Someone call this function every frames.
   */
  tick(): void;
}

export class Player implements IPlayer {
  private gunTree: IGun | null;
  private firingProgress: IterableIterator<void> | null;
  private readonly muzzle: { [key: string]: IMuzzle };
  private readonly firingStateGenerator: (player: IPlayer) => IFiringState;

  public constructor(
    muzzle: { [key: string]: IMuzzle },
    firingStateGenerator: (player: IPlayer) => IFiringState
  ) {
    this.gunTree = null;
    this.firingProgress = null;
    this.muzzle = muzzle;
    this.firingStateGenerator = firingStateGenerator;
  }

  public get isRunning(): boolean {
    return this.firingProgress !== null;
  }

  public getMuzzle(muzzleName: string): IMuzzle {
    if (!(muzzleName in this.muzzle))
      throw new Error(`muzzle ${muzzleName} is not set`);
    return this.muzzle[muzzleName];
  }

  public setGunTree(gunTree: IGun): void {
    this.gunTree = gunTree;
  }

  public start(): boolean {
    if (this.gunTree === null) throw new Error("GunTree was not set");
    this.firingProgress = this.gunTree.play(this.firingStateGenerator(this));
    return this.tick();
  }

  public tick(): boolean {
    if (this.firingProgress === null) return true;
    const r = this.firingProgress.next();

    if (!r.done) return false;

    this.firingProgress = null;
    return true;
  }
}

/**
 * Create Player with default classes.
 *
 * @param muzzle Muzzles used for firing
 */
export const createDefaultPlayer = (muzzle: {
  [key: string]: IMuzzle;
}): IPlayer => {
  return new Player(
    muzzle,
    (player): IFiringState => {
      return new FiringState(player, new FireData(), new RepeatStateManager());
    }
  );
};
