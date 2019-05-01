import { FiringState, FireData, FireDataModifier } from "guntree/firing-state";
import { ModifierGun } from "guntree/elements/gunModifier";
import { simpleMock } from "../util";

describe("#ModifyGun", (): void => {
  test("can modify FireData immediately", (): void => {
    // Given FireDataModifier
    const fdMod = simpleMock<FireDataModifier>();
    fdMod.modifyFireData = jest.fn();

    // And ModifierGun with immediately
    const modGun = new ModifierGun(false, fdMod);

    // When play ModifierGun
    const firingState = simpleMock<FiringState>();
    firingState.fireData = simpleMock<FireData>();
    modGun.play(firingState).next();

    // Then modified
    expect(fdMod.modifyFireData).toBeCalledWith(
      firingState,
      firingState.fireData
    );
  });

  test("can modify FireData later", (): void => {
    // Given FireDataModifier
    const fdMod = simpleMock<FireDataModifier>();
    fdMod.modifyFireData = jest.fn();

    // And ModifierGun with later
    const modGun = new ModifierGun(true, fdMod);

    // When play ModifierGun
    const firingState = simpleMock<FiringState>();
    firingState.pushModifier = jest.fn();
    modGun.play(firingState).next();

    // Then modifier was pushed
    expect(firingState.pushModifier).toBeCalledWith(fdMod);
  });
});
