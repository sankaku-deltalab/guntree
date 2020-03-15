import { FiringState } from "guntree/firing-state";
import { ModifierGun, FireDataModifier } from "guntree/elements/";
import { simpleMock } from "../util";

describe("#ModifyGun", (): void => {
  test("can modify FireData later", (): void => {
    // Given FireDataModifier
    const fdMod = simpleMock<FireDataModifier>();
    const mod = jest.fn();
    fdMod.createModifier = jest.fn().mockReturnValue(mod);

    // And ModifierGun
    const modGun = new ModifierGun(fdMod);

    // When play ModifierGun
    const firingState = simpleMock<FiringState>();
    firingState.pushModifier = jest.fn();
    modGun.play(simpleMock(), simpleMock(), firingState).next();

    // Then modifier was pushed
    expect(firingState.pushModifier).toBeCalledWith(mod);

    // And pushed modifier was not use yet
    expect(mod).not.toBeCalled();
  });
});
