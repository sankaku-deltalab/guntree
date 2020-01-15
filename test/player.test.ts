import { range } from "lodash";

import { FiringState } from "guntree/firing-state";
import { DefaultPlayer } from "guntree/player";
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
    stateMaster.fireData = simpleMock();
    stateMaster.repeatStates = simpleMock();

    // And gun tree
    const gunTree = createGunMockConsumeFrames(0);

    // And Player
    const owner = simpleMock<Owner>();
    const player = new DefaultPlayer(owner, (): FiringState => stateMaster);

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
    const owner = simpleMock<Owner>();
    const player = new DefaultPlayer(owner, (): FiringState => stateMaster);

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
  `("can continue gun tree", ({ gunTreeLength }): void => {
    // Given FiringState as master with clone
    const state = createFiringStateMock();
    const stateMaster = createFiringStateMock(state);

    // And Player with gun tree
    const owner = simpleMock<Owner>();
    const gunTree = createGunMockConsumeFrames(gunTreeLength);
    const player = new DefaultPlayer(owner, (): FiringState => stateMaster);
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
  });

  test("can deal muzzle", (): void => {
    // Given Player with owner
    const owner = simpleMock<Owner>();
    const muzzleTrans = jest.fn();
    owner.getMuzzleTransform = jest.fn().mockReturnValueOnce(muzzleTrans);
    const player = new DefaultPlayer(owner, simpleMock());

    // When get muzzle from player
    const muzzle = player.getMuzzle("a");

    // And get muzzle transform
    const trans = muzzle.getMuzzleTransform();

    // Then gotten transform was dealt from owner
    expect(owner.getMuzzleTransform).toBeCalled();
    expect(trans).toBe(muzzleTrans);
  });
});
