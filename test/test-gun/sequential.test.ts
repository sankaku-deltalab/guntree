import { range } from "lodash";

import { IGun } from "guntree/gun";
import { IFiringState } from "guntree/firing-state";
import { Sequential } from "guntree/elements/gun";
import { createGunMockConsumeFrames, createFiringStateMock } from "../util";

describe("#Sequential", (): void => {
  test("play multiple guns as sequentially and each guns are played with cloned state", (): void => {
    // Given firing state
    const gunNum = 3;
    const clones = range(gunNum).map(
      (_): IFiringState => createFiringStateMock()
    );
    const state = createFiringStateMock(...clones);

    // And guns
    const childFrames = 5;
    const guns = range(gunNum).map(
      (_): IGun => createGunMockConsumeFrames(childFrames)
    );

    // And Sequential
    const sec = new Sequential(...guns);

    // When play Concat
    const progress = sec.play(state);
    let consumedFrames = 0;
    while (true) {
      const r = progress.next();
      if (r.done) break;

      // Then play child guns as sequentially with state without copy
      const idx = Math.floor(consumedFrames / childFrames);
      expect(guns[idx].play).toBeCalledTimes(1);
      expect(guns[idx].play).toBeCalledWith(clones[idx]);

      for (const gun of guns.slice(idx + 1)) {
        expect(gun.play).toBeCalledTimes(0);
      }

      consumedFrames += 1;
    }

    // And finish Concat with childFrames * gunNum frames
    expect(consumedFrames).toBe(childFrames * gunNum);
  });
});
