export interface IRepeatState {
    finished: number;
    total: number;
}

export interface IFiringState {
    parameter: Map<string, number>;

    copy(): IFiringState;

    getRepeatState(position: number): IRepeatState;
    getRepeatStateByName(name: string): IRepeatState;
}

export function getRepeatStateByTarget(state: IFiringState, target: number | string | undefined): IRepeatState {
    if (typeof target === 'number') return state.getRepeatState(target);
    if (typeof target === 'string') return state.getRepeatStateByName(target);
    return state.getRepeatState(0);
}
