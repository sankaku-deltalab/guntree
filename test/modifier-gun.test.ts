import { ModifierGun } from 'guntree/gun';
import { TFireDataModifier, IFiringState } from 'guntree/firing-state';

describe('#ModifierGun', () => {
    test.each`
    timing
    ${'immediately'}
    ${'later'}
    `('call generator when played', ({ timing }) => {
        // Given FireDataModifier generator
        const modifier = jest.fn();
        const modifierGenerator = jest.fn().mockReturnValueOnce(modifier);

        // And ModifierGun
        const mg = new ModifierGun(timing, modifierGenerator);

        // And FiringState
        const state = new (jest.fn<IFiringState>(() => ({
            pushModifier: jest.fn(),
        })));

        // When call play
        mg.play(state).next();

        // Then modifier generator was called
        expect(modifierGenerator).toBeCalledTimes(1);
        expect(modifierGenerator).toBeCalledWith(state);
    });
});
