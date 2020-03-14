import { Bullet } from "guntree/bullet";
import { FiringState } from "guntree/firing-state";
import { Fire } from "guntree/elements/gun";
import { Owner } from "guntree/owner";
import { FireData } from "guntree/fire-data";
import { Player } from "guntree/player";
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
    const elapsedSec = 123;
    const owner = simpleMock<Owner>();
    const emitFunc = jest.fn();
    const player = simpleMock<Player>({
      events: { emit: emitFunc },
      getElapsedSeconds: jest.fn().mockReturnValueOnce(elapsedSec)
    });
    const state = new FiringState();

    const result = fire.play(owner, player, state).next();

    // Then Fire gun use Player's emitter and elapsed seconds
    expect(emitFunc).toBeCalledTimes(1);
    expect(emitFunc).toBeCalledWith("fired", fdClone, bullet);
    expect(fdClone.elapsedSec).toBe(elapsedSec);

    // And Gun was finished
    expect(result.done).toBe(true);
  });
});
