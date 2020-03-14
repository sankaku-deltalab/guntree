import { range } from "lodash";

import { Gun } from "guntree/gun";
import { FiringState } from "guntree/firing-state";
import { Owner } from "guntree/owner";
import { Player } from "guntree/player";
import { Sequential } from "guntree/elements/gun";
import {
  createGunMockConsumeFrames,
  createFiringStateMock,
  simpleMock
} from "../util";

describe("#Sequential", (): void => {
  test("play multiple guns as sequentially and each guns are played with cloned state", (): void => {
    // Given firing state
    const gunNum = 3;
    const clones = range(gunNum).map(
      (_): FiringState => createFiringStateMock()
    );
    const state = createFiringStateMock(...clones);

    // And guns
    const childFrames = 5;
    const guns = range(gunNum).map(
      (_): Gun => createGunMockConsumeFrames(childFrames)
    );

    // And Sequential
    const sec = new Sequential(...guns);

    // When play Concat
    const owner = simpleMock<Owner>();
    const player = simpleMock<Player>();
    const progress = sec.play(owner, player, state);
    let consumedFrames = 0;
    while (true) {
      const r = progress.next();
      if (r.done) break;

      // Then play child guns as sequentially with state without copy
      const idx = Math.floor(consumedFrames / childFrames);
      expect(guns[idx].play).toBeCalledTimes(1);
      expect(guns[idx].play).toBeCalledWith(owner, player, clones[idx]);

      for (const gun of guns.slice(idx + 1)) {
        expect(gun.play).toBeCalledTimes(0);
      }

      consumedFrames += 1;
    }

    // And finish Concat with childFrames * gunNum frames
    expect(consumedFrames).toBe(childFrames * gunNum);
  });
});
