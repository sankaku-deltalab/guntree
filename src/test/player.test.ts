import { range } from 'lodash';

import { IFiringState, IGun, IBullet } from 'guntree/gun';
import { Player, IPlayerOwner } from 'guntree/player';
import { Parameter } from 'guntree/parameter';

const createGun = (frames: number): IGun => {
    const gunClass = jest.fn<IGun>((f: number) => ({
        play: jest.fn().mockImplementation(() => {
            function* playing(): IterableIterator<void> {
                for (const _ of range(f)) yield;
            }
            return playing();
        }),
    }));
    return new gunClass(frames);
};

const createEmptyMock = <T>(): T => {
    const cls = jest.fn<T>(() => ({}));
    return new cls();
};

describe('#Player', () => {
    test('can start gun tree', () => {
        // Given gun tree
        const gunTree = createGun(0);

        // And Player
        const player = new Player(createEmptyMock());

        // When set gun tree to player
        player.setGunTree(gunTree);

        // And start player
        player.start();

        // Then gun tree was played
        expect(gunTree.play).toBeCalledTimes(1);
    });

    test('throw error if start without gun tree', () => {
        // Given Player
        const player = new Player(createEmptyMock());

        // When start player without gun tree
        const starting = () => player.start();

        // Then throw error
        expect(starting).toThrowError();
    });

    test.each`
        gunTreeLength
        ${0}
        ${1}
        ${12}
    `('can continue gun tree', ({ gunTreeLength }) => {
        // Given Player with gun tree
        const gunTree = createGun(gunTreeLength);
        const player = new Player(createEmptyMock());
        player.setGunTree(gunTree);

        // When start player
        const doneAtFirst = player.start();
        expect(doneAtFirst).toBe(gunTreeLength === 0);

        // And play full tick
        for (const i of range(gunTreeLength)) {
            expect(player.isRunning).toBe(true);
            const done = player.tick();
            expect(done).toBe((i === gunTreeLength - 1));
        }

        // Then playing was finished
        expect(player.isRunning).toBe(false);
    });

    test('notify firing to owner', () => {
        // Given player with owner
        const poClass = jest.fn<IPlayerOwner>((f: number) => ({
            notifyFired: jest.fn(),
        }));
        const owner = new poClass();
        const player = new Player(owner);

        // When player notified fired
        const state = createEmptyMock<IFiringState>();
        const bullet = createEmptyMock<IBullet>();
        player.notifyFired(state, bullet);

        // Then owner notified fired
        expect(owner.notifyFired).toBeCalledTimes(1);
        expect(owner.notifyFired).toBeCalledWith(player, state, bullet);
    });

    test.each`
        name          | value
        ${'angle'}    | ${0}
        ${'aimAngle'} | ${0}
        ${'speed'}    | ${1}
        ${'size'}     | ${1}
    `('initialize parameter `$name` to $value', ({ name, value }) => {
        // Given Player with gun tree
        const gunTree = createGun(0);
        const player = new Player(createEmptyMock());
        player.setGunTree(gunTree);

        // When start player
        player.start();

        // Then gun was played with state and state parameter was initialized
        const gunState: IFiringState = (<jest.Mock> gunTree.play).mock.calls[0][0];
        expect(gunState.parameters.get(name)).toEqual(new Parameter(value));
    });

    test('can add initial parameter', () => {
        // Given parameter name and value
        const additionalParameters = {
            abc: 15,
            cde: 24,
        };

        // And Player with gun tree and parameter
        const gunTree = createGun(0);
        const player = new Player(createEmptyMock(), { additionalParameters });
        player.setGunTree(gunTree);

        // When start player
        player.start();

        // Then gun was played with state and state parameter was initialized
        const gunState: IFiringState = (<jest.Mock> gunTree.play).mock.calls[0][0];
        for (const [name, value] of Object.entries(additionalParameters)) {
            expect(gunState.parameters.get(name)).toEqual(new Parameter(value));
        }

        // And default parameters are still alive
        const defaultParameters: [string, number][] = [
            ['angle', 0],
            ['aimAngle', 0],
            ['speed', 1],
            ['size', 1],
        ];
        for (const [name, value] of defaultParameters) {
            expect(gunState.parameters.get(name)).toEqual(new Parameter(value));
        }
    });
});