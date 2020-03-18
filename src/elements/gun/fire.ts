import { Gun } from "../../gun";
import { Bullet } from "../../bullet";
import { FiringState } from "../../firing-state";
import { FireData } from "../../fire-data";
import { Owner } from "../../owner";
import { PlayerLike } from "../../player";

/**
 * Fire bullet.
 */
export class Fire implements Gun {
  /** Bullet would fired */
  private readonly bullet: Bullet;
  private readonly fireData: FireData;

  /**
   * @param bullet Fired bullet
   */
  public constructor(bullet: Bullet, fireData = new FireData()) {
    this.bullet = bullet;
    this.fireData = fireData;
  }

  public *play(
    owner: Owner,
    player: PlayerLike,
    state: FiringState
  ): IterableIterator<void> {
    const fd = this.fireData.copy();
    fd.elapsedSec = player.getElapsedSeconds();
    state.modifyFireData(fd);
    player.events.emit("fired", fd, this.bullet);
  }
}
