import { range } from 'lodash';

import { IFiringState } from 'guntree/firing-state';
import { Player } from 'guntree/player';
import { IMuzzle } from 'guntree/muzzle';
import { simpleMock, createGunMockConsumeFrames } from './util';

describe('#Player', () => {
    test('can start gun tree', () => {
        // Given gun tree
        const gunTree = createGunMockConsumeFrames(0);

        // And Player
        const player = new Player(simpleMock());

        // When set gun tree to player
        player.setGunTree(gunTree);

        // And start player
        player.start();

        // Then gun tree was played
        expect(gunTree.play).toBeCalledTimes(1);
    });

    test('throw error if start without gun tree', () => {
        // Given Player
        const player = new Player(simpleMock());

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
        const gunTree = createGunMockConsumeFrames(gunTreeLength);
        const player = new Player(simpleMock());
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

    test.each`
        name          | value
        ${'speed'}    | ${1}
        ${'size'}     | ${1}
    `('initialize parameter `$name` to $value', ({ name, value }) => {
        // Given Player with gun tree
        const gunTree = createGunMockConsumeFrames(0);
        const player = new Player(simpleMock());
        player.setGunTree(gunTree);

        // When start player
        player.start();

        // Then gun was played with state and state parameter was initialized
        const gunState: IFiringState = (<jest.Mock>gunTree.play).mock.calls[0][0];
        expect(gunState.fireData.parameters.get(name)).toEqual(value);
    });

    test('can set muzzle at constructed and get there', () => {
        // Given parameter name and value
        const muzzle = simpleMock<IMuzzle>();

        // And Player with muzzle
        const player = new Player({ muzzle: { a: muzzle } });

        // When get muzzle from player
        const gottenMuzzle = player.getMuzzle('a');

        // Then gotten muzzle be set muzzle
        expect(gottenMuzzle).toBe(muzzle);
    });

    test('can add initial parameter', () => {
        // Given parameter name and value
        const additionalParameters = {
            abc: 15,
            cde: 24,
        };

        // And Player with gun tree and parameter
        const gunTree = createGunMockConsumeFrames(0);
        const player = new Player({ additionalParameters, muzzle: {} });
        player.setGunTree(gunTree);

        // When start player
        player.start();

        // Then gun was played with state and state parameter was initialized
        const gunState: IFiringState = (<jest.Mock>gunTree.play).mock.calls[0][0];
        for (const [name, value] of Object.entries(additionalParameters)) {
            expect(gunState.fireData.parameters.get(name)).toEqual(value);
        }

        // And default parameters are still alive
        const defaultParameters: [string, number][] = [
            ['speed', 1],
            ['size', 1],
        ];
        for (const [name, value] of defaultParameters) {
            expect(gunState.fireData.parameters.get(name)).toEqual(value);
        }
    });

    test('can add initial text', () => {
        // Given text name and value
        const additionalTexts = {
            abc: '125',
            cde: 'FGH',
        };

        // And Player with gun tree and parameter
        const gunTree = createGunMockConsumeFrames(0);
        const player = new Player({ additionalTexts, muzzle: {} });
        player.setGunTree(gunTree);

        // When start player
        player.start();

        // Then gun was played with state and state texts was initialized
        const gunState: IFiringState = (<jest.Mock>gunTree.play).mock.calls[0][0];
        for (const [name, value] of Object.entries(additionalTexts)) {
            expect(gunState.fireData.texts.get(name)).toBe(value);
        }
    });
});
