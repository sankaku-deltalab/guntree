import { IFiringState, IFireData } from 'guntree/firing-state';
import { ModifyParameterModifier } from 'guntree/elements/gunModifier';
import { simpleMock } from '../util';

const fireDataClass = jest.fn<IFireData>((parameters: Map<string, number>) => ({
    parameters,
}));

describe('#ModifyParameterModifier', () => {
    test('modify already set parameter', () => {
        // Given firing state
        const state = simpleMock<IFiringState>();

        // And FireData with parameter
        const name = 'a';
        const initialValue = 0.5;
        const fd = new fireDataClass(new Map([[name, initialValue]]));

        // And ModifyParameterModifier
        const value = 1;
        const modifier = jest.fn().mockReturnValueOnce(value);
        const setParameterMod = new ModifyParameterModifier(name, modifier);

        // When play SetParameterImmediately
        setParameterMod.modifyFireData(state, fd);

        // Then parameter was set
        expect(fd.parameters).toEqual(new Map([[name, value]]));
    });

    test('can not modify unset parameter', () => {
        // Given firing state
        const state = simpleMock<IFiringState>();

        // And FireData with parameter
        const name = 'a';
        const initialValue = 0.5;
        const fd = new fireDataClass(new Map([[name, initialValue]]));

        // And ModifyParameterModifier with unset name
        const unsetName = 'b';
        const value = 1;
        const modifier = jest.fn().mockReturnValueOnce(value);
        const setParameterMod = new ModifyParameterModifier(unsetName, modifier);

        // When play SetParameterImmediately
        const mod = () => setParameterMod.modifyFireData(state, fd);

        // Then error was thrown
        expect(mod).toThrow(Error);
    });
});
