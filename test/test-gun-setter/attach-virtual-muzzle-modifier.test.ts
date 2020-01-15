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
    const state = simpleMock<FiringState>();
    const baseMuzzle = simpleMock<Muzzle>();
    state.muzzle = baseMuzzle;

    // And AttachVirtualMuzzleUpdater
    const virtualMuzzleGenerator = simpleMock<VirtualMuzzleGenerator>();
    virtualMuzzleGenerator.generate = jest
      .fn()
      .mockReturnValueOnce(virtualMuzzle);
    const attachMuzzleMod = new AttachVirtualMuzzleUpdater(
      virtualMuzzleGenerator
    );

    // When use AttachVirtualMuzzleUpdater
    attachMuzzleMod.updateFiringState(state);

    // Then muzzle was attached
    expect(state.muzzle).toBe(virtualMuzzle);

    // And virtual muzzle was based on state muzzle
    expect(virtualMuzzle.basedOn).toBeCalledWith(baseMuzzle);
  });
});
