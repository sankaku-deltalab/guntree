import { Bullet } from "guntree/bullet";
import { FiringState } from "guntree/firing-state";
import { Fire } from "guntree/elements/gun";
import { Owner } from "guntree/owner";
import { FireData } from "guntree/fire-data";
import { simpleMock } from "../util";

describe("#Fire", (): void => {
  test("notify firing to owner", (): void => {
    // Given Fire
    const bullet = simpleMock<Bullet>();
    const fireData = new FireData();
    const fdClone = new FireData();
    fireData.copy = jest.fn().mockReturnValueOnce(fdClone);
    const fire = new Fire(bullet, fireData);

    // When play Fire with one frame
    const owner = simpleMock<Owner>();
    owner.fire = jest.fn();
    const state = new FiringState();

    const result = fire.play(owner, state).next();

    // Then owner.fire was called with modified FireData and bullet
    expect(owner.fire).toBeCalledTimes(1);
    expect(owner.fire).toBeCalledWith(fdClone, bullet);

    // And Gun was finished
    expect(result.done).toBe(true);
  });
});
