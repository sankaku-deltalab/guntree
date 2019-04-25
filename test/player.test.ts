import { range } from 'lodash';

import { IFiringState } from 'guntree/firing-state';
import { Player } from 'guntree/player';
import { IMuzzle } from 'guntree/muzzle';
import { simpleMock, createGunMockConsumeFrames, createFiringStateMock } from './util';

describe('#Player', () => {
    test('can start gun tree', () => {
        // Given FiringState as master with clone
        const state = createFiringStateMock();
        const stateMaster = createFiringStateMock(state);
        stateMaster.fireData = simpleMock();
        stateMaster.repeatStates = simpleMock();

        // And gun tree
        const gunTree = createGunMockConsumeFrames(0);

        // And Player
        const player = new Player({}, () => stateMaster);

        // When set gun tree to player
        player.setGunTree(gunTree);

        // And start player
        player.start();

        // Then gun tree was played
        expect(gunTree.play).toBeCalledTimes(1);
    });

    test('throw error if start without gun tree', () => {
        // Given FiringState as master with clone
        const state = createFiringStateMock();
        const stateMaster = createFiringStateMock(state);

        // And Player
        const player = new Player({}, () => stateMaster);

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
        // Given FiringState as master with clone
        const state = createFiringStateMock();
        const stateMaster = createFiringStateMock(state);

        // And Player with gun tree
        const gunTree = createGunMockConsumeFrames(gunTreeLength);
        const player = new Player({}, () => stateMaster);
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

    test('can set muzzle at constructed and get there', () => {
        // Given parameter name and value
        const muzzle = simpleMock<IMuzzle>();

        // And Player with muzzle
        const player = new Player({ a: muzzle }, simpleMock());

        // When get muzzle from player
        const gottenMuzzle = player.getMuzzle('a');

        // Then gotten muzzle be set muzzle
        expect(gottenMuzzle).toBe(muzzle);
    });
});
