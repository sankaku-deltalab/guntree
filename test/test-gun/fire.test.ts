import { Bullet } from "guntree/bullet";
import { FiringState } from "guntree/firing-state";
import { Fire } from "guntree/elements/gun";
import { simpleMock } from "../util";

describe("#Fire", (): void => {
  test("notify firing to firing state", (): void => {
    // Given FiringState
    const state = simpleMock<FiringState>();
    state.fire = jest.fn();

    // And Bullet
    const bullet = simpleMock<Bullet>();

    // And Fire
    const fire = new Fire(bullet);

    // When play Fire with one frame
    const progress = fire.play(state);
    progress.next();

    // Then parameter has added only once
    expect(state.fire).toBeCalledTimes(1);
    expect(state.fire).toBeCalledWith(bullet);
  });

  test("do not consume frames", (): void => {
    // Given FiringState
    const state = simpleMock<FiringState>();
    state.fire = jest.fn();

    // And Bullet
    const bullet = simpleMock<Bullet>();

    // And Fire
    const fire = new Fire(bullet);

    // When play Fire with one frame
    const progress = fire.play(state);
    const result = progress.next();

    // Then progress was finished
    expect(result.done).toBe(true);
  });
});
