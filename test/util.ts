import { ILazyEvaluative } from 'guntree/lazyEvaluative';

export const simpleMock = <T>() => {
    const cls = jest.fn<T>();
    return new cls();
};

export const leOnce = <T>(value: T) => {
    const leClass = jest.fn<ILazyEvaluative<T>>((value: T) => ({
        calc: jest.fn().mockReturnValue(value),
    }));
    return new leClass(value);
};
