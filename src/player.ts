import { Gun } from "./gun";
import { FiringState } from "./firing-state";
import { Muzzle } from "./muzzle";
import { Owner } from "./owner";

/**
 * Player play guntree.
 */
export class Player {
  private firingProgress: IterableIterator<void> | null;
  private readonly muzzle: Map<string, Muzzle>;

  public constructor() {
    this.firingProgress = null;
    this.muzzle = new Map();
  }

  /** Is playing guntree. */
  public isRunning(): boolean {
    return this.firingProgress !== null;
  }

  /**
   * Start playing guntree.
   */
  public start(
    owner: Owner,
    gunTree: Gun,
    firingState = new FiringState()
  ): boolean {
    this.firingProgress = gunTree.play(owner, firingState);
    return this.tick();
  }

  /**
   * Continue playing guntree.
   * Someone call this function every frames.
   */
  public tick(): boolean {
    if (this.firingProgress === null) return true;
    const r = this.firingProgress.next();

    if (!r.done) return false;

    this.firingProgress = null;
    return true;
  }
}
