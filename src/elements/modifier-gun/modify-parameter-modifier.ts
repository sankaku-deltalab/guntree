import { FiringState } from "../../firing-state";
import { FireData } from "guntree/fire-data";
import { FireDataModifier } from "./modifier-gun";

/**
 * Modify parameter with given function later.
 */
export class ModifyParameterModifier implements FireDataModifier {
  private readonly name: string;
  private readonly modifier: (
    state: FiringState
  ) => (oldValue: number) => number;

  public constructor(
    name: string,
    modifier: (state: FiringState) => (oldValue: number) => number
  ) {
    this.name = name;
    this.modifier = modifier;
  }

  public createModifier(state: FiringState): (fireData: FireData) => void {
    const mod = this.modifier(state);
    return (fireData: FireData): void => {
      const oldValue = fireData.parameters.get(this.name);
      if (oldValue === undefined)
        throw new Error(`parameter <${this.name}> was not set`);
      fireData.parameters.set(this.name, mod(oldValue));
    };
  }
}
