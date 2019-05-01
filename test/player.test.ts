import { range } from "lodash";

import { FiringState } from "guntree/firing-state";
import { DefaultPlayer } from "guntree/player";
import { Muzzle } from "guntree/muzzle";
import {
  simpleMock,
  createGunMockConsumeFrames,
  createFiringStateMock
} from "./util";

describe("#Player", (): void => {
  test("can start gun tree", (): void => {
    // Given FiringState as master with clone
    const state = createFiringStateMock();
    const stateMaster = createFiringStateMock(state);
    stateMaster.fireData = simpleMock();
    stateMaster.repeatStates = simpleMock();

    // And gun tree
    const gunTree = createGunMockConsumeFrames(0);

    // And Player
    const player = new DefaultPlayer({}, (): FiringState => stateMaster);

    // When set gun tree to player
    player.setGunTree(gunTree);

    // And start player
    player.start();

    // Then gun tree was played
    expect(gunTree.play).toBeCalledTimes(1);
  });

  test("throw error if start without gun tree", (): void => {
    // Given FiringState as master with clone
    const state = createFiringStateMock();
    const stateMaster = createFiringStateMock(state);

    // And Player
    const player = new DefaultPlayer({}, (): FiringState => stateMaster);

    // When start player without gun tree
    const starting = (): boolean => player.start();

    // Then throw error
    expect(starting).toThrowError();
  });

  test.each`
    gunTreeLength
    ${0}
    ${1}
    ${12}
  `(
    "can continue gun tree",
    ({ gunTreeLength }): void => {
      // Given FiringState as master with clone
      const state = createFiringStateMock();
      const stateMaster = createFiringStateMock(state);

      // And Player with gun tree
      const gunTree = createGunMockConsumeFrames(gunTreeLength);
      const player = new DefaultPlayer({}, (): FiringState => stateMaster);
      player.setGunTree(gunTree);

      // When start player
      const doneAtFirst = player.start();
      expect(doneAtFirst).toBe(gunTreeLength === 0);

      // And play full tick
      for (const i of range(gunTreeLength)) {
        expect(player.isRunning).toBe(true);
        const done = player.tick();
        expect(done).toBe(i === gunTreeLength - 1);
      }

      // Then playing was finished
      expect(player.isRunning).toBe(false);
    }
  );

  test("can set muzzle at constructed and get there", (): void => {
    // Given parameter name and value
    const muzzle = simpleMock<Muzzle>();

    // And Player with muzzle
    const player = new DefaultPlayer({ a: muzzle }, simpleMock());

    // When get muzzle from player
    const gottenMuzzle = player.getMuzzle("a");

    // Then gotten muzzle be set muzzle
    expect(gottenMuzzle).toBe(muzzle);
  });
});
