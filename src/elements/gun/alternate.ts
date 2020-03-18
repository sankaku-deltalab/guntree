import { Gun } from "../../gun";
import { FiringState } from "../../firing-state";
import { Owner } from "../../owner";
import { PlayerLike } from "../../player";
import { ModifierGun } from "../modifier-gun/modifier-gun";
import { Concat } from "./concat";
import { Sequential } from "./sequential";
import { InvertTransformModifier } from "../modifier-gun";
import { SetterGun } from "../setter-gun/setter-gun";
import { UseMuzzleUpdater } from "../setter-gun/use-muzzle-updater";

/**
 * Alternate play gun and inverted gun as sequential.
 * Alternate can use another muzzle for inverted gun.
 */
export class Alternate implements Gun {
  private readonly parallel: Gun;

  public constructor(option: { invertedMuzzleName?: string }, gun: Gun) {
    const invert = new ModifierGun(new InvertTransformModifier());
    const mirroredChild: Gun[] = [];
    // Set muzzle if name was specified
    if (option.invertedMuzzleName !== undefined) {
      mirroredChild.push(
        new SetterGun(new UseMuzzleUpdater(option.invertedMuzzleName))
      );
    }
    mirroredChild.push(invert);
    mirroredChild.push(gun);

    this.parallel = new Sequential(gun, new Concat(...mirroredChild));
  }

  public *play(
    owner: Owner,
    player: PlayerLike,
    state: FiringState
  ): IterableIterator<void> {
    yield* this.parallel.play(owner, player, state);
  }
}
