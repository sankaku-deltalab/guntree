import { IFiringState, IFireData } from 'guntree/firing-state';
import { AttachVirtualMuzzleImmediatelyModifier } from 'guntree/elements/gunModifier';
import { IMuzzle, IVirtualMuzzle, IVirtualMuzzleGenerator } from 'guntree/muzzle';
import { simpleMock } from '../util';

describe('#AttachVirtualMuzzleImmediately', () => {
    test('attach virtual muzzle to current FiringState muzzle', () => {
        // Given Virtual muzzle generator
        const virtualMuzzle = simpleMock<IVirtualMuzzle>();
        virtualMuzzle.basedOn = jest.fn();

        // And FiringState with muzzle
        const state = simpleMock<IFiringState>();
        const baseMuzzle = simpleMock<IMuzzle>();
        state.muzzle = baseMuzzle;

        // And FireData
        const fd = simpleMock<IFireData>();

        // And AttachVirtualMuzzleImmediatelyModifier
        const virtualMuzzleGenerator = simpleMock<IVirtualMuzzleGenerator>();
        virtualMuzzleGenerator.generate = jest.fn().mockReturnValueOnce(virtualMuzzle);
        const attachMuzzleMod = new AttachVirtualMuzzleImmediatelyModifier(virtualMuzzleGenerator);

        // When modify AttachVirtualMuzzleImmediatelyModifier
        attachMuzzleMod.modifyFireData(state, fd);

        // Then muzzle was attached
        expect(state.muzzle).toBe(virtualMuzzle);

        // And virtual muzzle was based on state muzzle
        expect(virtualMuzzle.basedOn).toBeCalledWith(baseMuzzle);
    });
});
