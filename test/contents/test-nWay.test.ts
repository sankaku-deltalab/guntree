import * as mat from "transformation-matrix";

import {
  DefaultFiringState,
  DefaultRepeatStateManager,
  DefaultFireData,
  FireData
} from "guntree/firing-state";
import { simpleMock } from "../util";
import { fire, bullet, nWay } from "guntree/contents";
import { Muzzle } from "guntree/muzzle";
import { decomposeTransform } from "guntree/transform-util";
import { Player } from "guntree/player";

describe.only("#nWay", (): void => {
  test("can add angle twice", (): void => {
    // Given firing state
    const muzzle = simpleMock<Muzzle>();
    muzzle.getMuzzleTransform = jest.fn().mockReturnValue(mat.rotateDEG(0));
    const rsm = new DefaultRepeatStateManager();
    const fd = new DefaultFireData();
    const player = simpleMock<Player>();
    player.getMuzzle = jest.fn().mockReturnValue(muzzle);
    const fs = new DefaultFiringState(player, fd, rsm);
    fs.muzzle = muzzle;

    const angles: number[] = [];
    muzzle.fire = jest.fn().mockImplementation((data: FireData) => {
      const [_posInAreaPoint, rotationDeg, _scale] = decomposeTransform(
        data.transform
      );
      angles.push(rotationDeg);
    });

    // When play nested nway
    const repeat = nWay(
      { ways: 3, totalAngle: 90 },
      nWay({ ways: 2, totalAngle: 4 }, fire(bullet()))
    );
    const progress = repeat.play(fs);
    while (true) {
      const r = progress.next();
      if (r.done) break;
    }

    // Then double angles was applied
    const expectedAngles = [-31, -29, -1, 1, 29, 31];
    expect(angles).toHaveLength(expectedAngles.length);
    expectedAngles.map((expected, idx) => {
      const actual = angles[idx];
      expect(actual).toBeCloseTo(expected);
    });
  });
});
