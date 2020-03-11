import { range } from "lodash";

import { Player } from "guntree/player";
import {
  simpleMock,
  createGunMockConsumeFrames,
  createFiringStateMock
} from "./util";
import { Owner } from "guntree/owner";

describe("#Player", (): void => {
  test("can start gun tree", (): void => {
    // Given FiringState as master with clone
    const state = createFiringStateMock();
    const stateMaster = createFiringStateMock(state);
    stateMaster.repeatStates = simpleMock();

    // And gun tree
    const gunTree = createGunMockConsumeFrames(0);

    // And Player
    const owner = simpleMock<Owner>();
    const player = new Player();

    // When start player
    player.start(owner, gunTree);

    // Then gun tree was played
    expect(gunTree.play).toBeCalledTimes(1);
  });

  test.each`
    gunTreeLength
    ${0}
    ${1}
    ${12}
  `("can continue gun tree", ({ gunTreeLength }): void => {
    // Given Player
    const player = new Player();

    // When start player
    const owner = simpleMock<Owner>();
    const gunTree = createGunMockConsumeFrames(gunTreeLength);
    const doneAtFirst = player.start(owner, gunTree);
    expect(doneAtFirst).toBe(gunTreeLength === 0);

    // And play full tick
    for (const i of range(gunTreeLength)) {
      expect(player.isRunning()).toBe(true);
      const done = player.tick();
      expect(done).toBe(i === gunTreeLength - 1);
    }

    // Then playing was finished
    expect(player.isRunning()).toBe(false);
  });
});
