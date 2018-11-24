import { IFiringState, IBullet, Fire } from 'guntree/gun';

describe('#Fire', () => {
    test('notify fired to firing state', () => {
        // Given repeating progress
        const firingStateClass = jest.fn<IFiringState>(() => ({
            notifyFired: jest.fn(),
        }));
        const state = new firingStateClass();

        // And Bullet
        const bulletClass = jest.fn<IBullet>(() => ({}));
        const bullet = new bulletClass();

        // And Fire
        const fire = new Fire(bullet);

        // When play Add with one frame
        const progress = fire.play(state);
        const result = progress.next();

        // Then parameter has added only once
        expect(state.notifyFired).toBeCalledTimes(1);
        expect(state.notifyFired).toBeCalledWith(bullet);

        // And progress was finished
        expect(result.done).toBe(true);
    });
});
