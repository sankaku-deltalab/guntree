import { VirtualMuzzleGenerator } from "../muzzle";
import * as vm from "../elements/virtual-muzzle";

/**
 * Create aiming virtual muzzle.
 *
 * ```typescript
 * const aimingFireFromCenter = concat(
 *   useMuzzle('centerMuzzle'),
 *   useVirtualMuzzle(aimingMuzzle()),
 *   fire(bullet()),
 * );
 * ```
 *
 */
export const aimingMuzzle = (): VirtualMuzzleGenerator => new vm.AimingMuzzle();

/**
 * Create fixed aiming virtual muzzle.
 * Aiming angle is fixed when this muzzle is used.
 *
 * ```typescript
 * const fixedAimingFireFromCenter = concat(
 *   useMuzzle('centerMuzzle'),
 *   useVirtualMuzzle(fixedAimMuzzle()),
 *   fire(bullet()),
 * );
 * ```
 *
 */
export const fixedAimMuzzle = (): VirtualMuzzleGenerator =>
  new vm.FixedAimMuzzle();
