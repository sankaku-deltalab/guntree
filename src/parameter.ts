/**
 * Parameter used for firing information e.g. bullet speed.
 * Parameter was modified by Guns via FiringState.
 */
export class Parameter {
    private value: number;
    private addingMultiplier: number;

    /**
     * @param initialValue
     */
    constructor(initialValue: number) {
        this.value = initialValue;
        this.addingMultiplier = 1;
    }

    /**
     * Get value.
     */
    getValue(): number {
        return this.value;
    }

    /**
     * Add value.
     * Adding value was multiplied if `multiplyLaterAdding` was called before added.
     *
     * @param adding
     */
    add(adding: number): number {
        const actual = adding * this.addingMultiplier;
        this.value += actual;
        return actual;
    }

    /**
     * On this `Parameter`, adding value would be multiplied.
     * This function multiplies that multiplier.
     *
     * @param multiplier
     */
    multiplyLaterAdding(multiplier: number): number {
        this.addingMultiplier *= multiplier;
        return this.addingMultiplier;
    }

    /**
     * Multiply current value.
     *
     * @param multiplier
     */
    multiply(multiplier: number): number {
        this.value *= multiplier;
        return multiplier;
    }

    /**
     * Reset value.
     * NOTE: Multiplier used when parameter added would not be reset.
     *
     * @param newValue
     */
    reset(newValue: number): void {
        this.value = newValue;
    }

    copy(): Parameter {
        const clone = new Parameter(this.value);
        clone.addingMultiplier = this.addingMultiplier;
        return clone;
    }
}
