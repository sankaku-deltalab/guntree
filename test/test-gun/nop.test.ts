import { Nop } from "guntree/elements/gun";
import { simpleMock } from "../util";

describe("#Nop", (): void => {
  test("do not consume frames", (): void => {
    // Given Nop
    const fire = new Nop();

    // When play Nop with one frame
    const progress = fire.play(simpleMock(), simpleMock(), simpleMock());
    const result = progress.next();

    // Then progress was finished
    expect(result.done).toBe(true);
  });
});
