export class Parameter {
    private value: number;

    constructor(initialValue: number) {
        this.value = initialValue;
    }

    calcValue(): number {
        return this.value;
    }
}
