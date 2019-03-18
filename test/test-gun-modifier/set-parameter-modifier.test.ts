import { IFiringState, IFireData } from 'guntree/firing-state';
import { SetParameterImmediatelyModifier } from 'guntree/elements/gunModifier';
import { simpleMock, leOnce } from '../util';

const fireDataClass = jest.fn<IFireData>((parameters: Map<string, number>) => ({
    parameters,
}));

describe('#SetParameterImmediatelyModifier', () => {
    test('can set value with unset name', () => {
        // Given firing state
        const state = simpleMock<IFiringState>();

        // And FireData
        const fd = new fireDataClass(new Map());

        // And SetParameterImmediatelyModifier
        const name = 'a';
        const value = 1;
        const setParameterMod = new SetParameterImmediatelyModifier(name, value);

        // When modify SetParameterImmediately
        setParameterMod.modifyFireData(state, fd);

        // Then parameter was set
        expect(fd.parameters).toEqual(new Map([[name, value]]));
    });

    test('can set value with already set name', () => {
        // Given firing state
        const state = simpleMock<IFiringState>();

        // And FireData with parameter
        const name = 'a';
        const initialValue = 0.5;
        const fd = new fireDataClass(new Map([[name, initialValue]]));

        // And SetParameterImmediatelyModifier
        const value = 1;
        const setParameterMod = new SetParameterImmediatelyModifier(name, value);

        // When modify SetParameterImmediately
        setParameterMod.modifyFireData(state, fd);

        // Then parameter was set
        expect(fd.parameters).toEqual(new Map([[name, value]]));
    });

    test('can set value with lazyEvaluative value', () => {
        // Given firing state
        const state = simpleMock<IFiringState>();

        // And FireData
        const fd = new fireDataClass(new Map());

        // And SetParameterImmediatelyModifier
        const name = 'a';
        const valueConst = 1;
        const valueLe = leOnce(valueConst);
        const setParameterMod = new SetParameterImmediatelyModifier(name, valueLe);

        // When modify SetParameterImmediately
        setParameterMod.modifyFireData(state, fd);

        // Then parameter was set
        expect(fd.parameters).toEqual(new Map([[name, valueConst]]));
    });
});
