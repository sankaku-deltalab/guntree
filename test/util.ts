import { range } from 'lodash';

import { IGun } from 'guntree/gun';
import { ILazyEvaluative } from 'guntree/lazyEvaluative';
import { IFiringState, IRepeatStateManager, IRepeatState } from 'guntree/firing-state';

export const simpleMock = <T>() => {
    const cls = jest.fn<T, []>();
    return new cls();
};

export const createLazyEvaluativeMockReturnOnce = <T>(value: T) => {
    const leClass = jest.fn<ILazyEvaluative<T>, [T]>((value: T) => ({
        calc: jest.fn().mockReturnValueOnce(value),
    }));
    return new leClass(value);
};

export const createGunMockConsumeFrames = (frames: number): IGun => {
    const gun = simpleMock<IGun>();
    gun.play = jest.fn().mockImplementation(() => {
        function* playing(): IterableIterator<void> {
            for (const _ of range(frames)) yield;
        }
        return playing();
    });
    return gun;
};

export const createFiringStateMock = (...clones: IFiringState[]): IFiringState => {
    const state = simpleMock<IFiringState>();
    let copyFunction = jest.fn();
    clones.map((clone) => {
        copyFunction = copyFunction.mockReturnValueOnce(clone);
    });
    state.copy = copyFunction;
    state.pushModifier = jest.fn();
    return state;
};

export const createRepeatStateManagerMock = (...clones: IRepeatStateManager[]): IRepeatStateManager => {
    const rsm = simpleMock<IRepeatStateManager>();
    let copyFunction = jest.fn();
    clones.map((clone) => {
        copyFunction = copyFunction.mockReturnValueOnce(clone);
    });
    rsm.copy = copyFunction;
    rsm.start = jest.fn().mockImplementation((rs: IRepeatState) => rs);
    rsm.finish = jest.fn();
    return rsm;
};
