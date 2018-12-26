import { IFiringState, TVector2D } from 'guntree/gun';
import { IPlayer } from 'guntree/player';
import { GetLocation } from 'guntree/contents/lazyEvaluative';

describe('#GetLocation', () => {
    test('deal location gotten from player', () => {
        // Given repeating progress
        const vec: TVector2D = { x: 23, y: 84 };
        const playerClass = jest.fn<IPlayer>(() => ({
            getLocation: jest.fn().mockReturnValueOnce(vec),
        }));
        const player = new playerClass();
        const stateClass = jest.fn<IFiringState>(() => ({
            player,
        }));
        const state = new stateClass();

        // When eval GetLocation
        const name = 'a';
        const getLoc = new GetLocation(name);
        const actual = getLoc.calc(state);

        // Then deal rounded value
        expect(actual).toEqual(vec);
        expect(player.getLocation).toBeCalledTimes(1);
        expect(player.getLocation).toBeCalledWith(name);
    });
});
