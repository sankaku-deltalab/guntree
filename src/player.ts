import { Gun } from "./gun";
import { FiringState } from "./firing-state";
import { Owner } from "./owner";

/**
 * Player play guntree.
 */
export class Player {
  private loop = false;
  private owner?: Owner;
  private gunTree?: Gun;
  private firingState?: FiringState;
  private firingProgress: IterableIterator<void> | null = null;

  /**
   * Is playing guntree.
   *
   * @returns Player is playing guntree.
   */
  public isRunning(): boolean {
    return this.firingProgress !== null;
  }

  /**
   * Is in loop.
   *
   * @returns Player is in loop.
   */
  public isInLoopMode(): boolean {
    return this.loop;
  }

  public start(
    loop: boolean,
    owner: Owner,
    gunTree: Gun,
    firingState = new FiringState()
  ): boolean {
    this.loop = loop;
    if (loop) {
      this.owner = owner;
      this.gunTree = gunTree;
      this.firingState = firingState.copy();
    }
    this.firingProgress = gunTree.play(owner, firingState);
    return this.tick();
  }

  /**
   * Stop playing after finish current loop.
   */
  public requestStop(): void {
    this.loop = false;
  }

  /**
   * Stop playing immediately.
   */
  public forceStop(): void {
    this.firingProgress = null;
  }

  /**
   * Continue playing guntree as fixed frame rate.
   *
   * @returns Is finished
   */
  public tick(): boolean {
    if (this.firingProgress === null) return true;
    const r = this.firingProgress.next();

    if (!r.done) return false;
    if (r.done && this.loop) {
      if (!this.owner || !this.gunTree || !this.firingState) throw new Error();
      return this.start(true, this.owner, this.gunTree, this.firingState);
    }
    this.firingProgress = null;
    return true;
  }
}
