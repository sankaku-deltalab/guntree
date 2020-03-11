import { range } from "lodash";

import { Gun } from "guntree/gun";
import { FiringState } from "guntree/firing-state";
import { Parallel } from "guntree/elements/gun";
import { Owner } from "guntree/owner";
import {
  createGunMockConsumeFrames,
  createFiringStateMock,
  simpleMock
} from "../util";

describe("#Parallel", (): void => {
  test("play multiple guns as parallel and each guns are played with cloned state", (): void => {
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

    // And Parallel
    const sec = new Parallel(...guns);

    // When play Concat
    const owner = simpleMock<Owner>();
    const progress = sec.play(owner, state);
    let consumedFrames = 0;
    while (true) {
      const r = progress.next();
      if (r.done) break;

      // Then play child guns as parallel with state without copy
      for (const idx of range(gunNum)) {
        expect(guns[idx].play).toBeCalledTimes(1);
        expect(guns[idx].play).toBeCalledWith(owner, clones[idx]);
      }

      consumedFrames += 1;
    }

    // And finish Concat with childFrames frames
    expect(consumedFrames).toBe(childFrames);
  });
});
