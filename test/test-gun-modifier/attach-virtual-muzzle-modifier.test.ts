import { FiringState, FireData } from "guntree/firing-state";
import { AttachVirtualMuzzleImmediatelyModifier } from "guntree/elements/gunModifier";
import { Muzzle, VirtualMuzzle, VirtualMuzzleGenerator } from "guntree/muzzle";
import { simpleMock } from "../util";

describe("#AttachVirtualMuzzleImmediately", (): void => {
  test("attach virtual muzzle to current FiringState muzzle", (): void => {
    // Given Virtual muzzle generator
    const virtualMuzzle = simpleMock<VirtualMuzzle>();
    virtualMuzzle.basedOn = jest.fn();

    // And FiringState with muzzle
    const state = simpleMock<FiringState>();
    const baseMuzzle = simpleMock<Muzzle>();
    state.muzzle = baseMuzzle;

    // And FireData
    const fd = simpleMock<FireData>();

    // And AttachVirtualMuzzleImmediatelyModifier
    const virtualMuzzleGenerator = simpleMock<VirtualMuzzleGenerator>();
    virtualMuzzleGenerator.generate = jest
      .fn()
      .mockReturnValueOnce(virtualMuzzle);
    const attachMuzzleMod = new AttachVirtualMuzzleImmediatelyModifier(
      virtualMuzzleGenerator
    );

    // When modify AttachVirtualMuzzleImmediatelyModifier
    attachMuzzleMod.modifyFireData(state, fd);

    // Then muzzle was attached
    expect(state.muzzle).toBe(virtualMuzzle);

    // And virtual muzzle was based on state muzzle
    expect(virtualMuzzle.basedOn).toBeCalledWith(baseMuzzle);
  });
});
