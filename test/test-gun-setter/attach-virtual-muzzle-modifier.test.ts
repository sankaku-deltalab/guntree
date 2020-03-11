import { FiringState } from "guntree/firing-state";
import { AttachVirtualMuzzleUpdater } from "guntree/elements/gunSetter";
import { Muzzle, VirtualMuzzle, VirtualMuzzleGenerator } from "guntree/muzzle";
import { simpleMock } from "../util";

describe("#AttachVirtualMuzzleUpdater", (): void => {
  test("attach virtual muzzle to current FiringState muzzle", (): void => {
    // Given Virtual muzzle generator
    const virtualMuzzle = simpleMock<VirtualMuzzle>();
    virtualMuzzle.basedOn = jest.fn();

    // And FiringState with muzzle
    const state = new FiringState();
    const baseMuzzle = simpleMock<Muzzle>();
    state.setMuzzle(baseMuzzle);

    // And AttachVirtualMuzzleUpdater
    const virtualMuzzleGenerator = simpleMock<VirtualMuzzleGenerator>();
    virtualMuzzleGenerator.generate = jest
      .fn()
      .mockReturnValueOnce(virtualMuzzle);
    const attachMuzzleMod = new AttachVirtualMuzzleUpdater(
      virtualMuzzleGenerator
    );

    // When use AttachVirtualMuzzleUpdater
    attachMuzzleMod.updateFiringState(simpleMock(), state);

    // Then muzzle was attached
    expect(state.getMuzzle()).toBe(virtualMuzzle);

    // And virtual muzzle was based on state muzzle
    expect(virtualMuzzle.basedOn).toBeCalledWith(baseMuzzle);
  });
});
