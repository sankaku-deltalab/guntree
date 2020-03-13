import { Gun } from "./gun";
import { FiringState } from "./firing-state";
import { Owner } from "./owner";

class FixedFrameratePlayer {
  private loop = false;
  private owner?: Owner;
  private gunTree?: Gun;
  private firingState?: FiringState;
  private firingProgress: IterableIterator<void> | null = null;

  public isRunning(): boolean {
    return this.firingProgress !== null;
  }

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

  public requestStop(): void {
    this.loop = false;
  }

  public forceStop(): void {
    this.firingProgress = null;
  }

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

/**
 * Player play guntree with dynamic or fixed framerate.
 */
export class Player {
  private readonly frameSec = 1 / 60;
  private elapsedSec = 0;
  private readonly player: FixedFrameratePlayer;

  constructor(player = new FixedFrameratePlayer()) {
    this.player = player;
  }

  /**
   * Start playing guntree.
   */
  public start(
    loop: boolean,
    owner: Owner,
    gunTree: Gun,
    firingState = new FiringState()
  ): boolean {
    this.elapsedSec = 0;
    return this.player.start(loop, owner, gunTree, firingState);
  }

  /**
   * Is playing guntree.
   *
   * @returns Player is playing guntree.
   */
  public isRunning(): boolean {
    return this.player.isRunning();
  }

  /**
   * Is in loop.
   *
   * @returns Player is in loop.
   */
  public isInLoopMode(): boolean {
    return this.player.isInLoopMode();
  }

  /**
   * Get seconds since finish current frame.
   *
   * @returns Seconds.
   */
  public getElapsedSeconds(): number {
    return this.elapsedSec;
  }

  /**
   * Stop playing after finish current loop.
   */
  public requestStop(): void {
    this.player.requestStop();
  }

  /**
   * Stop playing immediately.
   */
  public forceStop(): void {
    this.player.forceStop();
  }

  /**
   * Continue playing guntree as fixed frame rate.
   *
   * @returns Is finished
   */
  public tick(): boolean {
    return this.player.tick();
  }

  /**
   * Continue playing guntree as dynamic frame rate.
   *
   * @param deltaSec Delta time in seconds
   * @returns Is finished
   */
  public update(deltaSec: number): boolean {
    if (!this.player.isRunning()) return true;

    this.elapsedSec += deltaSec;
    while (this.elapsedSec >= this.frameSec) {
      this.elapsedSec -= this.frameSec;
      const finished = this.tick();
      if (finished) return true;
    }
    return false;
  }
}
