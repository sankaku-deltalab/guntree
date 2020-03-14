import { Gun } from "../gun";
import { TConstantOrLazy } from "../lazyEvaluative";
import * as setO from "../elements/gunSetter";
import { VirtualMuzzleGenerator } from "../muzzle";

/**
 * Define parameter.
 *
 * ```typescript
 * const dangerousFire = concat(
 *   useParameter('dangerousness', 9999),
 *   fire(bullet()),
 * );
 * ```
 *
 * @param name Parameter name.
 * @param value Initial parameter value.
 */
export const useParameter = (
  name: string,
  value: TConstantOrLazy<number>
): Gun => {
  return new setO.SetterGun(new setO.UseParameterUpdater(name, value));
};

/**
 * Define text.
 *
 * ```typescript
 * const dangerousFire = concat(
 *   useText('isDangerous', 'yes'),
 *   fire(bullet()),
 * );
 * ```
 *
 * @param name Text name.
 * @param text Initial text.
 */
export const useText = (name: string, text: TConstantOrLazy<string>): Gun => {
  return new setO.SetterGun(new setO.UseTextUpdater(name, text));
};

/**
 * Use muzzle.
 * Every firing need muzzle.
 *
 * ```typescript
 * const firing = concat(
 *   useMuzzle('centerMuzzle'),
 *   fire(bullet()),
 * );
 * ```
 *
 * @param name Muzzle name
 */
export const useMuzzle = (name: TConstantOrLazy<string>): Gun => {
  return new setO.SetterGun(new setO.UseMuzzleUpdater(name));
};

/**
 * Attach virtual muzzle to current muzzle.
 *
 * ```typescript
 * const aimingFireFromCenter = concat(
 *   useMuzzle('centerMuzzle'),
 *   useVirtualMuzzle(aimingMuzzle()),
 *   fire(bullet()),
 * );
 * ```
 *
 * @param virtualMuzzleGenerator Generate attaching virtual muzzle.
 */
export const useVirtualMuzzle = (
  virtualMuzzleGenerator: VirtualMuzzleGenerator
): Gun => {
  return new setO.SetterGun(
    new setO.AttachVirtualMuzzleUpdater(virtualMuzzleGenerator)
  );
};
