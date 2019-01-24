import { IBullet } from 'guntree/gun';
import { IFiringState } from 'guntree/firing-state';
import { Fire } from 'guntree/elements/gun';
import { IPlayer } from 'guntree/player';

describe('#Fire', () => {
    test('notify fired to firing state', () => {
        // Given repeating progress
        const playerClass = jest.fn<IPlayer>(() => ({
            notifyFired: jest.fn(),
        }));
        const player = new playerClass();
        const firingStateClass = jest.fn<IFiringState>(() => ({
            player,
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
        expect(state.player.notifyFired).toBeCalledTimes(1);
        expect(state.player.notifyFired).toBeCalledWith(state, bullet);

        // And progress was finished
        expect(result.done).toBe(true);
    });
});
