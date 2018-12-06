import { IFiringState, TVector3D } from 'guntree/gun';
import { IPlayer } from 'guntree/player';
import { GetLocation } from 'guntree/lazy-evaluative';

describe('#GetLocation', () => {
    test('deal location gotten from player', () => {
        // Given repeating progress
        const vec: TVector3D = { x: 23, y: 84, z: 654 };
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
