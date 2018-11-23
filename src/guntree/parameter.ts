export class Parameter {
    private value: number;
    private addingMultiplier: number;

    constructor(initialValue: number) {
        this.value = initialValue;
        this.addingMultiplier = 1;
    }

    getValue(): number {
        return this.value;
    }

    add(adding: number): number {
        const actual = adding * this.addingMultiplier;
        this.value += actual;
        return actual;
    }

    multiplyLaterAdding(multiplier: number): number {
        this.addingMultiplier *= multiplier;
        return this.addingMultiplier;
    }

    multiply(multiplier: number): number {
        this.value *= multiplier;
        return multiplier;
    }

    reset(newValue: number): void {
        this.value = newValue;
    }
}
