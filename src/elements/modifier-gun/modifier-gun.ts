import { Gun } from "../../gun";
import { FiringState } from "../../firing-state";
import { FireData } from "../../fire-data";
import { Owner } from "../../owner";
import { PlayerLike } from "../../player";

export interface FireDataModifier {
  createModifier(state: FiringState): (fireData: FireData) => void;
}

/**
 * ModifierGun update FireData when fired.
 * Played before fire, and modify when fired.
 */
export class ModifierGun implements Gun {
  private readonly modifier: FireDataModifier;

  /**
   * @param modifier Used modifier
   */
  public constructor(modifier: FireDataModifier) {
    this.modifier = modifier;
  }

  public *play(
    _owner: Owner,
    player: PlayerLike,
    state: FiringState
  ): IterableIterator<void> {
    state.pushModifier(this.modifier.createModifier(state));
  }
}
