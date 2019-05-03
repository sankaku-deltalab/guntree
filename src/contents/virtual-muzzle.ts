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
export const aimingMuzzle = (): vm.AimingMuzzle => new vm.AimingMuzzle();

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
export const fixedAimMuzzle = (): vm.FixedAimMuzzle => new vm.FixedAimMuzzle();
