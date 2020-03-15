import { FiringState } from "../../firing-state";
import { VirtualMuzzleGenerator } from "../../muzzle";
import { Owner } from "guntree/owner";
import { FiringStateUpdater } from "./setter-gun";

/**
 * Attach virtual muzzle to current muzzle.
 */
export class AttachVirtualMuzzleUpdater implements FiringStateUpdater {
  private readonly virtualMuzzleGenerator: VirtualMuzzleGenerator;

  public constructor(virtualMuzzleGenerator: VirtualMuzzleGenerator) {
    this.virtualMuzzleGenerator = virtualMuzzleGenerator;
  }

  public updateFiringState(owner: Owner, state: FiringState): void {
    const muzzle = this.virtualMuzzleGenerator.generate();
    muzzle.basedOn(state.getMuzzle());
    state.setMuzzle(muzzle);
  }
}
