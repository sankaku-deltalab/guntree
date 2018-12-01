import { range } from 'lodash';

import { IFiringState, IGun } from 'guntree/gun';
import { Player } from 'guntree/player';

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

/**
- parameterが初期化されている
- playするとgunがplayされる
- 終了時に通知が飛ぶ
 */

describe('#Player', () => {
    test('can start gun tree', () => {
        // Given gun tree
        const gunTree = createGun(0);

        // And Player
        const player = new Player();

        // When set gun tree to player
        player.setGunTree(gunTree);

        // And start player
        player.start();

        // Then gun tree was played
        expect(gunTree.play).toBeCalledTimes(1);
    });

    test('throw error if start without gun tree', () => {
        // Given Player
        const player = new Player();

        // When start player without gun tree
        const starting = () => player.start();

        // Then throw error
        expect(starting).toThrowError();
    });

    test.skip('can continue gun tree', () => {});
    test.skip('notify completing of gun tree to owner', () => {});
    test.skip('notify firing to owner', () => {});

    test.skip.each`
        name          | value
        ${'angle'}    | 0
        ${'aimAngle'} | 0
        ${'speed'}    | 1
        ${'size'}     | 1
    `('initialize parameter `$name` to $value', ({ name, value }) => {
    });
});
