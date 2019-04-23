import { IFiringState } from 'guntree/firing-state';
import { Nop } from 'guntree/elements/gun';
import { simpleMock } from '../util';

describe('#Nop', () => {
    test('do not consume frames', () => {
        // Given FiringState
        const state = simpleMock<IFiringState>();

        // And Nop
        const fire = new Nop();

        // When play Nop with one frame
        const progress = fire.play(state);
        const result = progress.next();

        // Then progress was finished
        expect(result.done).toBe(true);
    });
});
