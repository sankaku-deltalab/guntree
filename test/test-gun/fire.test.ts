import { IBullet } from 'guntree/gun';
import { IFiringState } from 'guntree/firing-state';
import { Fire } from 'guntree/elements/gun';

describe('#Fire', () => {
    test('notify firing to firing state', () => {
        // Given FiringState
        const firingStateClass = jest.fn<IFiringState>(() => ({
            fire: jest.fn(),
        }));
        const state = new firingStateClass();

        // And Bullet
        const bulletClass = jest.fn<IBullet>(() => ({}));
        const bullet = new bulletClass();

        // And Fire
        const fire = new Fire(bullet);

        // When play Fire with one frame
        const progress = fire.play(state);
        progress.next();

        // Then parameter has added only once
        expect(state.fire).toBeCalledTimes(1);
        expect(state.fire).toBeCalledWith(bullet);
    });

    test('do not consume frames', () => {
        // Given FiringState
        const firingStateClass = jest.fn<IFiringState>(() => ({
            fire: jest.fn(),
        }));
        const state = new firingStateClass();

        // And Bullet
        const bulletClass = jest.fn<IBullet>(() => ({}));
        const bullet = new bulletClass();

        // And Fire
        const fire = new Fire(bullet);

        // When play Fire with one frame
        const progress = fire.play(state);
        const result = progress.next();

        // Then progress was finished
        expect(result.done).toBe(true);
    });
});
