import { Gun } from "./gun";
import {
  FiringState,
  DefaultFiringState,
  DefaultFireData,
  DefaultRepeatStateManager
} from "./firing-state";
import { Muzzle } from "./muzzle";
import { Owner } from "./owner";
import { RawMuzzle } from "./raw-muzzle";

/**
 * Player play guntree.
 */
export interface Player {
  /** Is playing guntree. */
  isRunning: boolean;

  /**
   * Get muzzle by name.
   * Muzzles owned by player should be defined by user.
   *
   * @param muzzleName Muzzle name
   */
  getMuzzle(muzzleName: string): Muzzle;

  /**
   * Set guntree.
   *
   * @param gunTree Setting guntree. Guntree can used by multiple player.
   */
  setGunTree(gunTree: Gun): void;

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

export class DefaultPlayer implements Player {
  private readonly owner: Owner;
  private gunTree: Gun | null;
  private firingProgress: IterableIterator<void> | null;
  private readonly muzzle: Map<string, Muzzle>;
  private readonly firingStateGenerator: (player: Player) => FiringState;

  public constructor(
    owner: Owner,
    firingStateGenerator: (player: Player) => FiringState
  ) {
    this.owner = owner;
    this.gunTree = null;
    this.firingProgress = null;
    this.muzzle = new Map();
    this.firingStateGenerator = firingStateGenerator;
  }

  public get isRunning(): boolean {
    return this.firingProgress !== null;
  }

  public getMuzzle(muzzleName: string): Muzzle {
    const mzl = this.muzzle.get(muzzleName);
    if (!mzl) {
      const muzzle = new RawMuzzle(this.owner, muzzleName);
      this.muzzle.set(muzzleName, muzzle);
      return muzzle;
    }
    return mzl;
  }

  public setGunTree(gunTree: Gun): void {
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
export const createDefaultPlayer = (owner: Owner): Player => {
  return new DefaultPlayer(
    owner,
    (player): FiringState => {
      return new DefaultFiringState(
        player,
        new DefaultFireData(),
        new DefaultRepeatStateManager()
      );
    }
  );
};
