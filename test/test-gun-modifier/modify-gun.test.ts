import { FiringState } from "guntree/firing-state";
import { ModifierGun, FireDataModifier } from "guntree/elements/gunModifier";
import { simpleMock } from "../util";

describe("#ModifyGun", (): void => {
  test("can modify FireData immediately", (): void => {
    // Given FireDataModifier
    const fdMod = simpleMock<FireDataModifier>();
    const mod = jest.fn();
    fdMod.createModifier = jest.fn().mockReturnValue(mod);

    // And ModifierGun with immediately
    const modGun = new ModifierGun(false, fdMod);

    // When play ModifierGun
    const firingState = simpleMock<FiringState>();
    modGun.play(firingState).next();

    // Then modified
    expect(fdMod.createModifier).toBeCalledWith(firingState);
  });

  test("can modify FireData later", (): void => {
    // Given FireDataModifier
    const fdMod = simpleMock<FireDataModifier>();
    const mod = jest.fn();
    fdMod.createModifier = jest.fn().mockReturnValue(mod);

    // And ModifierGun with later
    const modGun = new ModifierGun(true, fdMod);

    // When play ModifierGun
    const firingState = simpleMock<FiringState>();
    firingState.pushModifier = jest.fn();
    modGun.play(firingState).next();

    // Then modifier was pushed
    expect(firingState.pushModifier).toBeCalledWith(mod);
  });
});
