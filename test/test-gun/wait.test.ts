import { FiringState } from "guntree/firing-state";
import { Wait } from "guntree/elements/gun";
import { simpleMock, createLazyEvaluativeMockReturnOnce } from "../util";

describe("#Wait", (): void => {
  test("consume constant input frames", (): void => {
    // Given firing state
    const state = simpleMock<FiringState>();

    // And Wait
    const waitFrames = 3;
    const wait = new Wait(waitFrames);

    // When play Concat
    const progress = wait.play(simpleMock(), state);
    let consumedFrames = 0;
    while (true) {
      const r = progress.next();
      if (r.done) break;
      consumedFrames += 1;
    }

    // And finish Wait with input frames
    expect(consumedFrames).toBe(waitFrames);
  });

  test("consume lazyEvaluative input frames", (): void => {
    // Given firing state
    const state = simpleMock<FiringState>();

    // And lazyEvaluative
    const waitFrames = 3;
    const le = createLazyEvaluativeMockReturnOnce(waitFrames);

    // And Wait
    const wait = new Wait(le);

    // When play Concat
    const progress = wait.play(simpleMock(), state);
    let consumedFrames = 0;
    while (true) {
      const r = progress.next();
      if (r.done) break;
      consumedFrames += 1;
    }

    // And finish Wait with input frames
    expect(consumedFrames).toBe(waitFrames);
  });
});
