import { range } from "lodash";

import { Player } from "guntree/player";
import { simpleMock, createGunMockConsumeFrames } from "./util";
import { Owner } from "guntree/owner";

describe("#Player", (): void => {
  test("start gun tree", (): void => {
    // Given gun tree
    const gunTree = createGunMockConsumeFrames(0);

    // And Player
    const owner = simpleMock<Owner>();
    const player = new Player();

    // When start player
    player.start(false, owner, gunTree);

    // Then gun tree was played
    expect(gunTree.play).toBeCalledTimes(1);
  });

  test.each`
    loop
    ${true}
    ${false}
  `(
    "emit event when firing cycle was finished when $loop",
    ({ loop }): void => {
      // Given gun tree
      const gunFrames = 3;
      const gunTree = createGunMockConsumeFrames(gunFrames);

      // And Player
      const finishedCallback = jest.fn();
      const player = new Player();
      player.events.on("finished", finishedCallback);

      // When start player
      const owner = simpleMock<Owner>();
      player.start(loop, owner, gunTree);

      // And continue
      for (const _ of range(gunFrames)) {
        expect(player.isRunning()).toBe(true);
        expect(finishedCallback).not.toBeCalled();
        player.tick();
      }

      // Then finished event was called when finished
      expect(finishedCallback).toBeCalled();
    }
  );

  test("can stop loop if request stop when finished with event", (): void => {
    // Given gun tree
    const gunFrames = 3;
    const gunTree = createGunMockConsumeFrames(gunFrames);

    // And Player with stopping callback
    const player = new Player();
    const finishedCallback = (): void => {
      player.requestStop();
    };
    player.events.on("finished", finishedCallback);

    // When start player without loop
    const owner = simpleMock<Owner>();
    player.start(true, owner, gunTree);

    // And continue
    for (const _ of range(gunFrames)) {
      expect(player.isRunning()).toBe(true);
      player.tick();
    }

    // Then player was not running
    expect(player.isRunning()).toBe(false);
  });

  test.each`
    gunTreeLength
    ${0}
    ${1}
    ${12}
  `("can continue gun tree as fixed framerate", ({ gunTreeLength }): void => {
    // Given Player
    const player = new Player();

    // When start player
    const owner = simpleMock<Owner>();
    const gunTree = createGunMockConsumeFrames(gunTreeLength);
    const doneAtFirst = player.start(false, owner, gunTree);
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

  test.each`
    gunTreeLength | ticks
    ${12}         | ${30}
  `("can continue gun tree as loop", ({ gunTreeLength, ticks }): void => {
    // Given Player
    const player = new Player();

    // When start player
    const owner = simpleMock<Owner>();
    const gunTree = createGunMockConsumeFrames(gunTreeLength);
    const doneAtFirst = player.start(true, owner, gunTree);
    expect(doneAtFirst).toBe(false);

    // And play multiple tick
    for (const _ of range(ticks)) {
      expect(player.isRunning()).toBe(true);
      const done = player.tick();
      expect(done).toBe(false);
    }

    // Then playing is not finished
    expect(player.isRunning()).toBe(true);

    // And gun was played
    expect(gunTree.play).toBeCalledTimes(Math.ceil(ticks / gunTreeLength));
  });

  test.each`
    gunTreeLength
    ${0}
    ${1}
    ${12}
  `("can continue gun tree as dynamic framerate", ({ gunTreeLength }): void => {
    // Given Player
    const player = new Player();

    // When start player
    const owner = simpleMock<Owner>();
    const gunTree = createGunMockConsumeFrames(gunTreeLength);
    const doneAtFirst = player.start(false, owner, gunTree);
    expect(doneAtFirst).toBe(gunTreeLength === 0);

    // And play full time
    const updateNum = gunTreeLength * 2;
    const deltaSec = 1 / 60 / 2;
    for (const i of range(updateNum)) {
      expect(player.isRunning()).toBe(true);
      const done = player.update(deltaSec);
      expect(done).toBe(i === updateNum - 1);
    }

    // Then playing was finished
    expect(player.isRunning()).toBe(false);
  });

  test.each`
    gunTreeLength | ticks
    ${12}         | ${30}
  `(
    "can continue gun tree as dynamic framerate and loop",
    ({ gunTreeLength, ticks }): void => {
      // Given Player
      const player = new Player();

      // When start player
      const owner = simpleMock<Owner>();
      const gunTree = createGunMockConsumeFrames(gunTreeLength);
      const doneAtFirst = player.start(true, owner, gunTree);
      expect(doneAtFirst).toBe(false);

      // And play multiple tick
      const updateNum = ticks * 2;
      const deltaSec = 1 / 60 / 2;
      for (const _ of range(updateNum)) {
        expect(player.isRunning()).toBe(true);
        const done = player.update(deltaSec);
        expect(done).toBe(false);
      }

      // Then playing is not finished
      expect(player.isRunning()).toBe(true);

      // And gun was played
      expect(gunTree.play).toBeCalledTimes(Math.ceil(ticks / gunTreeLength));
    }
  );
});
