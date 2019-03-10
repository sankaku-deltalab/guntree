import { IFiringState } from 'guntree/firing-state';
import { AttachVirtualMuzzleImmediately } from 'guntree/elements/gunModifer';
import { IMuzzle, IVirtualMuzzle, IVirtualMuzzleGenerator } from 'guntree/muzzle';
import { simpleMock } from '../util';

describe('#AttachVirtualMuzzleImmediately', () => {
    test('attach virtual muzzle to current FiringState muzzle', () => {
        // Given Virtual muzzle generator
        const virtualMuzzle = simpleMock<IVirtualMuzzle>();
        virtualMuzzle.basedOn = jest.fn();
        const virtualMuzzleGenerator = simpleMock<IVirtualMuzzleGenerator>();
        virtualMuzzleGenerator.generate = jest.fn().mockReturnValueOnce(virtualMuzzle);

        // And FiringState with muzzle
        const state = simpleMock<IFiringState>();
        const baseMuzzle = simpleMock<IMuzzle>();
        state.muzzle = baseMuzzle;

        // And AttachVirtualMuzzleImmediately
        const attachMuzzle = new AttachVirtualMuzzleImmediately(virtualMuzzleGenerator);

        // When play AttachVirtualMuzzleImmediately
        attachMuzzle.play(state).next();

        // Then muzzle was attached
        expect(state.muzzle).toBe(virtualMuzzle);

        // And virtual muzzle was based on state muzzle
        expect(virtualMuzzle.basedOn).toBeCalledWith(baseMuzzle);
    });
});
