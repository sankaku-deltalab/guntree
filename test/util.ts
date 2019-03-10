export const simpleMock = <T>() => {
    const cls = jest.fn<T>();
    return new cls();
};
